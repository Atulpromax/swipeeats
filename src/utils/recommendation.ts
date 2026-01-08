/**
 * SwipeEats ML Recommendation System
 * 
 * Algorithm: Epsilon-Greedy with MMR Diversity
 * - 22-dim feature vectors (one-hot cuisine/ambiance + numeric)
 * - Time-decayed preference learning (7-day half-life)
 * - Cold start fade (100% → 0% over 15 swipes)
 * - Context awareness (time-of-day)
 * - MMR diversity reranking
 */

import { Restaurant, UserModel, SwipeContext, ScoredRestaurant, SwipeRecord } from '@/types';

const STORAGE_KEY = 'swipeEatsModel';
const FEATURE_DIM = 22;
const MODEL_VERSION = 1;

// Feature indices
const CUISINE_START = 0;
const CUISINE_COUNT = 9;  // north_indian, chinese, italian, continental, street_food, south_indian, asian, dessert, other
const AMBIANCE_START = 9;
const AMBIANCE_COUNT = 6; // romantic, casual, family, quick_bite, bar, rooftop
const NUMERIC_START = 15;
// 15: rating_raw, 16: rating_normalized, 17: price_log, 18: price_bucket, 19: distance_log, 20: has_dishes, 21: photo_count

// ============================================
// INITIALIZATION & STORAGE
// ============================================

export function initializeUserModel(): UserModel {
    return {
        version: MODEL_VERSION,
        likeWeights: new Array(FEATURE_DIM).fill(0),
        dislikeWeights: new Array(FEATURE_DIM).fill(0),
        featureUncertainty: new Array(FEATURE_DIM).fill(1.0), // High initial uncertainty
        featureConfidence: new Array(FEATURE_DIM).fill(0.5),
        totalLikes: 0,
        totalDislikes: 0,
        sprintCount: 0,
        lastSwipeTimestamp: Date.now(),
        timePreferences: {
            morning: { likes: 0, dislikes: 0 },
            lunch: { likes: 0, dislikes: 0 },
            evening: { likes: 0, dislikes: 0 },
            night: { likes: 0, dislikes: 0 }
        },
        swipeHistory: []
    };
}

export function loadUserModel(): UserModel {
    if (typeof window === 'undefined') {
        return initializeUserModel();
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return initializeUserModel();

        const model = JSON.parse(stored);

        // Migration from old system
        if (!model.version || model.version < MODEL_VERSION) {
            return migrateFromOldModel(model);
        }

        return model;
    } catch (e) {
        console.error('Failed to load model:', e);
        return initializeUserModel();
    }
}

export function saveUserModel(model: UserModel): void {
    if (typeof window === 'undefined') return;

    try {
        const serialized = JSON.stringify(model);
        const sizeKB = new Blob([serialized]).size / 1024;

        if (sizeKB > 100) {
            console.warn(`Model size ${sizeKB.toFixed(1)}KB exceeds 100KB. Pruning history...`);
            model.swipeHistory = model.swipeHistory.slice(-30);
        }

        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
        console.error('Failed to save model:', e);
    }
}

export function resetUserModel(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

// Migrate from old UserPreferences format
function migrateFromOldModel(oldModel: Record<string, unknown>): UserModel {
    const newModel = initializeUserModel();

    // Try to extract old swipe count
    if (typeof oldModel.swipeCount === 'number') {
        newModel.totalLikes = Math.floor(oldModel.swipeCount / 2);
        newModel.totalDislikes = Math.ceil(oldModel.swipeCount / 2);
    }

    // Old model had likeVector.textFeatures - try to map
    const oldLikeVector = oldModel.likeVector as Record<string, unknown> | undefined;
    if (oldLikeVector?.textFeatures) {
        const oldText = oldLikeVector.textFeatures as Record<string, number>;

        // Map old tokens to new cuisine indices
        if (oldText['italian'] > 0.1) newModel.likeWeights[2] = 0.5;
        if (oldText['chinese'] > 0.1) newModel.likeWeights[1] = 0.5;
        if (oldText['north'] > 0.1 || oldText['indian'] > 0.1) newModel.likeWeights[0] = 0.5;
        if (oldText['continental'] > 0.1) newModel.likeWeights[3] = 0.5;
        if (oldText['romantic'] > 0.1) newModel.likeWeights[9] = 0.5;
        if (oldText['casual'] > 0.1) newModel.likeWeights[10] = 0.5;
        if (oldText['bar'] > 0.1) newModel.likeWeights[13] = 0.5;
    }

    console.log('Migrated from old model to v1');
    return newModel;
}

// ============================================
// FEATURE EXTRACTION
// ============================================

export function extractFeatures(restaurant: Restaurant): number[] {
    const features = new Array(FEATURE_DIM).fill(0);
    const cuisine = (restaurant.cuisine || '').toLowerCase();
    const ambiance = (restaurant.ambiance_tags || []).map(t => t.toLowerCase());

    // Cuisine one-hot (indices 0-8)
    if (cuisine.includes('north indian') || cuisine.includes('mughlai')) features[0] = 1;
    if (cuisine.includes('chinese')) features[1] = 1;
    if (cuisine.includes('italian') || cuisine.includes('pizza') || cuisine.includes('pasta')) features[2] = 1;
    if (cuisine.includes('continental') || cuisine.includes('european')) features[3] = 1;
    if (cuisine.includes('street food') || cuisine.includes('chaat')) features[4] = 1;
    if (cuisine.includes('south indian') || cuisine.includes('dosa')) features[5] = 1;
    if (cuisine.includes('asian') || cuisine.includes('thai') || cuisine.includes('japanese') || cuisine.includes('korean')) features[6] = 1;
    if (cuisine.includes('dessert') || cuisine.includes('bakery') || cuisine.includes('cafe')) features[7] = 1;
    // "Other" if no cuisine matched
    if (features.slice(0, 8).every(v => v === 0)) features[8] = 1;

    // Ambiance one-hot (indices 9-14)
    if (ambiance.some(a => a.includes('romantic'))) features[9] = 1;
    if (ambiance.some(a => a.includes('casual') || a.includes('dining'))) features[10] = 1;
    if (ambiance.some(a => a.includes('family'))) features[11] = 1;
    if (ambiance.some(a => a.includes('quick') || a.includes('bite') || a.includes('fast'))) features[12] = 1;
    if (ambiance.some(a => a.includes('bar') || a.includes('pub') || a.includes('lounge'))) features[13] = 1;
    if (ambiance.some(a => a.includes('rooftop') || a.includes('terrace'))) features[14] = 1;

    // Numeric features (indices 15-21)
    features[15] = restaurant.rating || 0;
    features[16] = ((restaurant.rating || 0) - 2.5) / 2.5; // Centered around 0
    features[17] = Math.log(Math.max(restaurant.price_for_two || 500, 100)) / Math.log(10000);
    features[18] = Math.min(Math.floor((restaurant.price_for_two || 0) / 1000), 10);
    features[19] = Math.log(1 + (restaurant.distance || 0)) / Math.log(50);
    features[20] = (restaurant.popular_dishes || '').length > 0 ? 1 : 0;
    features[21] = Math.min((restaurant.image_urls || []).length, 5) / 5;

    return features;
}

// ============================================
// CONTEXT HELPERS
// ============================================

export function getTimeOfDay(hour?: number): 'morning' | 'lunch' | 'evening' | 'night' {
    const h = hour ?? new Date().getHours();
    if (h >= 6 && h < 11) return 'morning';
    if (h >= 11 && h < 16) return 'lunch';
    if (h >= 16 && h < 21) return 'evening';
    return 'night';
}

export function getCurrentContext(sprintNumber: number, swipeIndex: number): SwipeContext {
    const now = new Date();
    return {
        timeOfDay: getTimeOfDay(now.getHours()),
        dayOfWeek: now.getDay(),
        sprintNumber,
        swipeIndexInSprint: swipeIndex
    };
}

// ============================================
// PREFERENCE UPDATE
// ============================================

export function recordSwipe(
    model: UserModel,
    restaurant: Restaurant,
    liked: boolean,
    context: SwipeContext
): UserModel {
    const features = extractFeatures(restaurant);

    // Compute time-decayed learning rate
    const age = Date.now() - model.lastSwipeTimestamp;
    const decayFactor = Math.exp(-age / (7 * 24 * 3600 * 1000)); // 7-day half-life
    const totalSwipes = model.totalLikes + model.totalDislikes;
    const baseLR = Math.min(0.3, 2.0 / (totalSwipes + 1));
    const alpha = baseLR * Math.max(decayFactor, 0.1); // Minimum 10% learning rate

    // Update preference weights
    for (let i = 0; i < FEATURE_DIM; i++) {
        if (liked) {
            model.likeWeights[i] += alpha * features[i];
        } else {
            model.dislikeWeights[i] += alpha * features[i];
        }
    }

    if (liked) {
        model.totalLikes++;
    } else {
        model.totalDislikes++;
    }

    // Update uncertainty (Bayesian-inspired)
    const beta = 0.1;
    for (let i = 0; i < FEATURE_DIM; i++) {
        if (features[i] > 0) {
            const observed = liked ? 1 : -1;
            const expected = model.likeWeights[i] - model.dislikeWeights[i];
            const error = Math.pow(observed - expected, 2);

            model.featureUncertainty[i] = (1 - beta) * model.featureUncertainty[i] + beta * error;
            model.featureConfidence[i] = 1 / (1 + model.featureUncertainty[i]);
        }
    }

    // Update context preferences
    const timeSlot = model.timePreferences[context.timeOfDay];
    if (liked) {
        timeSlot.likes++;
    } else {
        timeSlot.dislikes++;
    }

    // Update history (keep last 50)
    const record: SwipeRecord = {
        restaurantId: restaurant.id,
        liked,
        timestamp: Date.now(),
        features,
        context
    };
    model.swipeHistory.push(record);
    if (model.swipeHistory.length > 50) {
        model.swipeHistory = model.swipeHistory.slice(-50);
    }

    model.lastSwipeTimestamp = Date.now();

    return { ...model };
}

// ============================================
// SCORING ALGORITHM
// ============================================

function dotProduct(a: number[], b: number[]): number {
    let sum = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

export function scoreRestaurants(
    restaurants: Restaurant[],
    model: UserModel,
    excludeIds: Set<string> = new Set(),
    context?: SwipeContext
): ScoredRestaurant[] {
    const ctx = context || getCurrentContext(model.sprintCount, 0);
    const totalSwipes = model.totalLikes + model.totalDislikes;

    // Epsilon decay: 30% → 5% over 50 swipes
    const epsilon = 0.05 + 0.25 * Math.exp(-totalSwipes / 20);

    // Context multiplier from time preferences
    const timeCtx = model.timePreferences[ctx.timeOfDay];
    const totalCtxSwipes = timeCtx.likes + timeCtx.dislikes;
    const contextMultiplier = totalCtxSwipes > 5
        ? 0.5 + 0.5 * (timeCtx.likes / totalCtxSwipes) // Range: 0.5 - 1.0
        : 1.0; // Neutral if not enough data

    // Score each restaurant
    const scored: ScoredRestaurant[] = restaurants
        .filter(r => !excludeIds.has(r.id))
        .map(r => {
            const features = extractFeatures(r);

            // Cold start handling (< 5 swipes)
            if (totalSwipes < 5) {
                const coldScore = (r.rating || 0) / 5.0 - (r.distance || 0) / 50.0 + Math.random() * 0.3;
                return {
                    ...r,
                    score: coldScore,
                    exploitationScore: 0,
                    explorationBonus: 0,
                    contextMultiplier: 1
                };
            }

            // Exploitation score (preference matching)
            const likeScore = dotProduct(features, model.likeWeights);
            const dislikeScore = dotProduct(features, model.dislikeWeights);
            const netPreference =
                likeScore / (model.totalLikes + 1) -
                dislikeScore / (model.totalDislikes + 1);

            // Exploration bonus (uncertainty-weighted)
            let uncertaintyScore = 0;
            for (let i = 0; i < FEATURE_DIM; i++) {
                if (features[i] > 0) {
                    uncertaintyScore += features[i] * model.featureUncertainty[i];
                }
            }
            const explorationBonus = epsilon * uncertaintyScore * Math.random(); // Add randomness

            // Blended score for transition period (5-15 swipes)
            let finalScore: number;
            if (totalSwipes < 15) {
                const coldStartWeight = (15 - totalSwipes) / 10; // 1.0 → 0.0
                const coldStartScore = (r.rating || 0) / 5.0 - (r.distance || 0) / 50.0;
                finalScore =
                    coldStartWeight * coldStartScore +
                    (1 - coldStartWeight) * (netPreference + explorationBonus);
            } else {
                finalScore = netPreference + explorationBonus;
            }

            // Apply context multiplier
            finalScore *= contextMultiplier;

            return {
                ...r,
                score: finalScore,
                exploitationScore: netPreference,
                explorationBonus,
                contextMultiplier
            };
        });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Apply MMR diversity reranking
    return applyMMRDiversity(scored, 0.3);
}

// ============================================
// MMR DIVERSITY RERANKING
// ============================================

function featureSimilarity(r1: Restaurant, r2: Restaurant): number {
    const f1 = extractFeatures(r1);
    const f2 = extractFeatures(r2);

    // Weights: higher for text features (cuisine/ambiance), lower for numeric
    const weights = [
        // Cuisines (indices 0-8)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        // Ambiance (indices 9-14)
        0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        // Numeric (indices 15-21)
        0.3, 0.3, 0.5, 0.5, 0.2, 0.1, 0.1
    ];

    let overlap = 0;
    let totalWeight = 0;

    for (let i = 0; i < FEATURE_DIM; i++) {
        // For binary features: exact match
        if (i < NUMERIC_START) {
            overlap += weights[i] * (f1[i] === f2[i] ? 1 : 0);
        } else {
            // For numeric: inverse of normalized difference
            const diff = Math.abs(f1[i] - f2[i]);
            overlap += weights[i] * (1 - Math.min(diff, 1));
        }
        totalWeight += weights[i];
    }

    return overlap / totalWeight;
}

function applyMMRDiversity(
    scored: ScoredRestaurant[],
    lambda: number
): ScoredRestaurant[] {
    if (scored.length <= 20) return scored;

    const selected: ScoredRestaurant[] = [];
    const remaining = [...scored];

    // Normalize scores to 0-1 range for MMR
    const maxScore = Math.max(...remaining.map(r => r.score));
    const minScore = Math.min(...remaining.map(r => r.score));
    const scoreRange = maxScore - minScore || 1;

    // First item: pure relevance (best score)
    selected.push(remaining[0]);
    remaining.splice(0, 1);

    // Select 19 more with MMR
    while (selected.length < 20 && remaining.length > 0) {
        let bestIdx = 0;
        let bestMMR = -Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const candidate = remaining[i];

            // Normalized relevance (0-1)
            const relevance = (candidate.score - minScore) / scoreRange;

            // Max similarity to already selected
            let maxSim = 0;
            for (const sel of selected) {
                const sim = featureSimilarity(candidate, sel);
                maxSim = Math.max(maxSim, sim);
            }

            // Diversity = 1 - similarity
            const diversity = 1 - maxSim;

            // MMR formula: λ * relevance + (1-λ) * diversity
            const mmrScore = lambda * relevance + (1 - lambda) * diversity;

            if (mmrScore > bestMMR) {
                bestMMR = mmrScore;
                bestIdx = i;
            }
        }

        selected.push(remaining[bestIdx]);
        remaining.splice(bestIdx, 1);
    }

    return selected;
}

// ============================================
// LEGACY API COMPATIBILITY
// ============================================

// These maintain API compatibility with existing hooks

export function loadPreferences(): UserModel {
    return loadUserModel();
}

export function savePreferences(model: UserModel): void {
    saveUserModel(model);
}

export function resetPreferences(): void {
    resetUserModel();
}

export function updatePreferences(
    model: UserModel,
    restaurant: Restaurant,
    liked: boolean
): UserModel {
    const context = getCurrentContext(model.sprintCount, model.totalLikes + model.totalDislikes);
    return recordSwipe(model, restaurant, liked, context);
}

import { Restaurant, UserPreferences, FeatureVector } from '@/types';

const STORAGE_KEY = 'swipeeats_preferences';

// Tokenize text fields into normalized tokens
function tokenize(text: string): string[] {
    if (!text) return [];
    return text
        .toLowerCase()
        .split(/[\s,]+/)
        .map(t => t.trim())
        .filter(t => t.length > 1);
}

// Extract feature vector from a restaurant
export function extractFeatures(restaurant: Restaurant, maxDistance: number = 30): FeatureVector {
    const textTokens: string[] = [
        ...tokenize(restaurant.cuisine),
        ...restaurant.ambiance_tags.map(t => t.toLowerCase().trim()),
        ...tokenize(restaurant.popular_dishes),
    ];

    // Count token frequencies
    const textFeatures: Record<string, number> = {};
    for (const token of textTokens) {
        textFeatures[token] = (textFeatures[token] || 0) + 1;
    }

    // Normalize numeric features to 0-1 range
    const rating = restaurant.rating / 5;
    const priceNormalized = Math.min(restaurant.price_for_two / 5000, 1);
    const distanceNormalized = Math.min((restaurant.distance || 10) / maxDistance, 1);

    return {
        textFeatures,
        rating,
        priceNormalized,
        distanceNormalized,
    };
}

// Calculate cosine similarity between two text feature vectors
function textSimilarity(a: Record<string, number>, b: Record<string, number>): number {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key of allKeys) {
        const valA = a[key] || 0;
        const valB = b[key] || 0;
        dotProduct += valA * valB;
        normA += valA * valA;
        normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Calculate overall similarity between two feature vectors
function calculateSimilarity(a: FeatureVector, b: FeatureVector): number {
    const textSim = textSimilarity(a.textFeatures, b.textFeatures);
    const ratingSim = 1 - Math.abs(a.rating - b.rating);
    const priceSim = 1 - Math.abs(a.priceNormalized - b.priceNormalized);

    // Weighted combination
    return 0.5 * textSim + 0.25 * ratingSim + 0.25 * priceSim;
}

// Update preference vector by averaging with new features
function updateVector(current: FeatureVector, newFeatures: FeatureVector, count: number): FeatureVector {
    // Exponential moving average factor
    const alpha = Math.min(0.3, 2 / (count + 1));

    // Merge text features
    const textFeatures: Record<string, number> = { ...current.textFeatures };
    for (const [key, value] of Object.entries(newFeatures.textFeatures)) {
        textFeatures[key] = (textFeatures[key] || 0) * (1 - alpha) + value * alpha;
    }

    return {
        textFeatures,
        rating: current.rating * (1 - alpha) + newFeatures.rating * alpha,
        priceNormalized: current.priceNormalized * (1 - alpha) + newFeatures.priceNormalized * alpha,
        distanceNormalized: current.distanceNormalized * (1 - alpha) + newFeatures.distanceNormalized * alpha,
    };
}

// Create empty feature vector
function emptyVector(): FeatureVector {
    return {
        textFeatures: {},
        rating: 0.7, // Slightly bias toward good ratings
        priceNormalized: 0.4, // Moderate price preference
        distanceNormalized: 0.3, // Prefer closer
    };
}

// Load preferences from localStorage
export function loadPreferences(): UserPreferences {
    if (typeof window === 'undefined') {
        return {
            likeVector: emptyVector(),
            dislikeVector: emptyVector(),
            swipeCount: 0,
            lastUpdated: Date.now(),
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load preferences:', e);
    }

    return {
        likeVector: emptyVector(),
        dislikeVector: emptyVector(),
        swipeCount: 0,
        lastUpdated: Date.now(),
    };
}

// Save preferences to localStorage
export function savePreferences(prefs: UserPreferences): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
        console.error('Failed to save preferences:', e);
    }
}

// Reset all preferences
export function resetPreferences(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

// Update preferences after a swipe
export function updatePreferences(
    prefs: UserPreferences,
    restaurant: Restaurant,
    liked: boolean
): UserPreferences {
    const features = extractFeatures(restaurant);
    const newCount = prefs.swipeCount + 1;

    if (liked) {
        return {
            likeVector: updateVector(prefs.likeVector, features, newCount),
            dislikeVector: prefs.dislikeVector,
            swipeCount: newCount,
            lastUpdated: Date.now(),
        };
    } else {
        return {
            likeVector: prefs.likeVector,
            dislikeVector: updateVector(prefs.dislikeVector, features, newCount),
            swipeCount: newCount,
            lastUpdated: Date.now(),
        };
    }
}

// Calculate personalization score for a restaurant
export function calculatePersonalizationScore(
    restaurant: Restaurant,
    prefs: UserPreferences
): number {
    const features = extractFeatures(restaurant);

    const likeSim = calculateSimilarity(features, prefs.likeVector);
    const dislikeSim = calculateSimilarity(features, prefs.dislikeVector);

    // Base personalization score
    let score = likeSim - 0.5 * dislikeSim;

    // Add exploration term (decreases as we have more swipes)
    const explorationWeight = Math.max(0.1, 0.5 / (1 + prefs.swipeCount * 0.1));
    score += explorationWeight * Math.random();

    return score;
}

// Cold start ranking when we don't have enough swipe data
export function coldStartScore(restaurant: Restaurant): number {
    // Weight factors
    const RATING_WEIGHT = 2.0;
    const DISTANCE_WEIGHT = 0.3;
    const MISSING_PENALTY = 0.5;

    let score = RATING_WEIGHT * (restaurant.rating || 3);

    // Penalize far restaurants
    const distance = restaurant.distance || 10;
    score -= DISTANCE_WEIGHT * Math.min(distance, 20);

    // Penalize missing data
    let missingFields = 0;
    if (!restaurant.cuisine) missingFields++;
    if (restaurant.image_urls.length === 0) missingFields++;
    if (!restaurant.price_for_two) missingFields++;
    score -= MISSING_PENALTY * missingFields;

    // Add small random factor for variety
    score += Math.random() * 0.5;

    return score;
}

// Score and sort restaurants based on preferences and cold start
export function scoreRestaurants(
    restaurants: Restaurant[],
    prefs: UserPreferences,
    excludeIds: Set<string> = new Set()
): Restaurant[] {
    const COLD_START_THRESHOLD = 5;

    return restaurants
        .filter(r => !excludeIds.has(r.id))
        .map(restaurant => {
            let score: number;

            if (prefs.swipeCount < COLD_START_THRESHOLD) {
                // Cold start: use simple heuristics
                score = coldStartScore(restaurant);
            } else {
                // Personalized scoring
                score = calculatePersonalizationScore(restaurant, prefs);
                // Still factor in rating and distance
                score += 0.3 * coldStartScore(restaurant);
            }

            return { ...restaurant, score };
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0));
}

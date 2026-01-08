// Restaurant data types for SwipeEats

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price_for_two: number;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  image_urls: string[];
  phone: string;
  popular_dishes: string;
  ambiance_tags: string[];
  url: string;
  distance?: number; // Calculated at runtime
  score?: number; // ML personalization score
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// ============================================
// NEW ML RECOMMENDATION SYSTEM TYPES
// ============================================

export interface SwipeContext {
  timeOfDay: 'morning' | 'lunch' | 'evening' | 'night';
  dayOfWeek: number;  // 0-6 (Sunday-Saturday)
  sprintNumber: number;
  swipeIndexInSprint: number;  // 0-19
}

export interface SwipeRecord {
  restaurantId: string;
  liked: boolean;
  timestamp: number;
  features: number[];  // 22-dim feature snapshot
  context: SwipeContext;
}

export interface TimePreference {
  likes: number;
  dislikes: number;
}

export interface UserModel {
  version: number;  // For migrations

  // Preference vectors (22-dim arrays)
  likeWeights: number[];
  dislikeWeights: number[];
  featureUncertainty: number[];
  featureConfidence: number[];

  // Statistics
  totalLikes: number;
  totalDislikes: number;
  sprintCount: number;
  lastSwipeTimestamp: number;

  // Context preferences
  timePreferences: {
    morning: TimePreference;
    lunch: TimePreference;
    evening: TimePreference;
    night: TimePreference;
  };

  // History (last 50 swipes only)
  swipeHistory: SwipeRecord[];
}

export interface ScoredRestaurant extends Restaurant {
  score: number;
  exploitationScore: number;
  explorationBonus: number;
  contextMultiplier: number;
}

// ============================================
// SPRINT STATE (unchanged)
// ============================================

export interface SprintState {
  swipeCount: number;
  likedRestaurants: Restaurant[];
  dislikedIds: Set<string>;
  isComplete: boolean;
  bestMatch: Restaurant | null;
}

export interface SwipeDirection {
  direction: 'left' | 'right';
  restaurant: Restaurant;
}

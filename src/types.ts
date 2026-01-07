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

export interface UserPreferences {
  likeVector: FeatureVector;
  dislikeVector: FeatureVector;
  swipeCount: number;
  lastUpdated: number;
}

export interface FeatureVector {
  textFeatures: Record<string, number>; // Token frequencies
  rating: number;
  priceNormalized: number;
  distanceNormalized: number;
}

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

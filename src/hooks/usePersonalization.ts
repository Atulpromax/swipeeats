'use client';

import { useState, useCallback, useEffect } from 'react';
import { Restaurant, UserPreferences } from '@/types';
import {
    loadPreferences,
    savePreferences,
    resetPreferences,
    updatePreferences,
    scoreRestaurants,
} from '@/utils/personalization';

export function usePersonalization() {
    const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());

    // Load preferences on mount (client-side only)
    useEffect(() => {
        setPreferences(loadPreferences());
    }, []);

    // Save preferences when they change
    useEffect(() => {
        savePreferences(preferences);
    }, [preferences]);

    const handleSwipe = useCallback((restaurant: Restaurant, liked: boolean) => {
        setPreferences(prev => updatePreferences(prev, restaurant, liked));
    }, []);

    const getScoredRestaurants = useCallback(
        (restaurants: Restaurant[], excludeIds: Set<string> = new Set()) => {
            return scoreRestaurants(restaurants, preferences, excludeIds);
        },
        [preferences]
    );

    const reset = useCallback(() => {
        resetPreferences();
        setPreferences(loadPreferences());
    }, []);

    return {
        preferences,
        handleSwipe,
        getScoredRestaurants,
        resetPreferences: reset,
        swipeCount: preferences.swipeCount,
    };
}

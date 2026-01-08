'use client';

import { useState, useCallback, useEffect } from 'react';
import { Restaurant, UserModel } from '@/types';
import {
    loadPreferences,
    savePreferences,
    resetPreferences,
    updatePreferences,
    scoreRestaurants,
    getCurrentContext,
} from '@/utils/recommendation';

export function usePersonalization() {
    const [model, setModel] = useState<UserModel>(() => loadPreferences());

    // Load model on mount (client-side only)
    useEffect(() => {
        setModel(loadPreferences());
    }, []);

    // Save model when it changes
    useEffect(() => {
        savePreferences(model);
    }, [model]);

    const handleSwipe = useCallback((restaurant: Restaurant, liked: boolean) => {
        setModel(prev => updatePreferences(prev, restaurant, liked));
    }, []);

    const getScoredRestaurants = useCallback(
        (restaurants: Restaurant[], excludeIds: Set<string> = new Set()) => {
            // Get current context for scoring
            const context = getCurrentContext(model.sprintCount, model.totalLikes + model.totalDislikes);
            return scoreRestaurants(restaurants, model, excludeIds, context);
        },
        [model]
    );

    const reset = useCallback(() => {
        resetPreferences();
        setModel(loadPreferences());
    }, []);

    return {
        preferences: model, // Keep old name for compatibility
        handleSwipe,
        getScoredRestaurants,
        resetPreferences: reset,
        swipeCount: model.totalLikes + model.totalDislikes,
    };
}

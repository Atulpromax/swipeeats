'use client';

import { useState, useCallback, useMemo } from 'react';
import { Restaurant, SprintState } from '@/types';

const SPRINT_SIZE = 20;

export function useSprint() {
    const [sprintState, setSprintState] = useState<SprintState>({
        swipeCount: 0,
        likedRestaurants: [],
        dislikedIds: new Set(),
        isComplete: false,
        bestMatch: null,
    });

    const recordSwipe = useCallback((restaurant: Restaurant, liked: boolean) => {
        setSprintState(prev => {
            const newLiked = liked
                ? [...prev.likedRestaurants, restaurant]
                : prev.likedRestaurants;

            const newDislikedIds = new Set(prev.dislikedIds);
            if (!liked) {
                newDislikedIds.add(restaurant.id);
            }

            const newCount = prev.swipeCount + 1;
            const isComplete = newCount >= SPRINT_SIZE;

            // Find best match (highest score among liked)
            const bestMatch = isComplete && newLiked.length > 0
                ? newLiked.reduce((best, current) =>
                    (current.score || 0) > (best.score || 0) ? current : best
                )
                : null;

            return {
                swipeCount: newCount,
                likedRestaurants: newLiked,
                dislikedIds: newDislikedIds,
                isComplete,
                bestMatch,
            };
        });
    }, []);

    const resetSprint = useCallback(() => {
        setSprintState({
            swipeCount: 0,
            likedRestaurants: [],
            dislikedIds: new Set(),
            isComplete: false,
            bestMatch: null,
        });
    }, []);

    const allSwipedIds = useMemo(() => {
        const ids = new Set(sprintState.dislikedIds);
        sprintState.likedRestaurants.forEach(r => ids.add(r.id));
        return ids;
    }, [sprintState.dislikedIds, sprintState.likedRestaurants]);

    return {
        ...sprintState,
        sprintSize: SPRINT_SIZE,
        recordSwipe,
        resetSprint,
        allSwipedIds,
        progress: sprintState.swipeCount / SPRINT_SIZE,
    };
}

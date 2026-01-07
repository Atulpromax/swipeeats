'use client';

import { useState, useEffect, useCallback } from 'react';
import { Restaurant, UserLocation } from '@/types';
import { parseRestaurantCSV } from '@/utils/csvParser';
import { getUserLocation, calculateDistance, DEFAULT_LOCATION } from '@/utils/location';

export function useRestaurants() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user location first
            const location = await getUserLocation();
            setUserLocation(location);

            // Parse CSV
            const data = await parseRestaurantCSV('/zomato_gurgaon_restaurants.csv');

            // Calculate distances
            const withDistances = data.map(restaurant => ({
                ...restaurant,
                distance: calculateDistance(
                    location.latitude,
                    location.longitude,
                    restaurant.latitude,
                    restaurant.longitude
                ),
            }));

            setRestaurants(withDistances);
        } catch (err) {
            setError('Failed to load restaurants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateDistances = useCallback((location: UserLocation) => {
        setUserLocation(location);
        setRestaurants(prev =>
            prev.map(restaurant => ({
                ...restaurant,
                distance: calculateDistance(
                    location.latitude,
                    location.longitude,
                    restaurant.latitude,
                    restaurant.longitude
                ),
            }))
        );
    }, []);

    return {
        restaurants,
        loading,
        error,
        userLocation,
        updateDistances,
        reload: loadData,
    };
}

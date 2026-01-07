'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Restaurant } from '@/types';
import { useRestaurants } from '@/hooks/useRestaurants';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useSprint } from '@/hooks/useSprint';
import { SwipeDeck } from '@/components/SwipeDeck';
import { ActionsBar } from '@/components/ActionsBar';
import { SprintCounter } from '@/components/SprintCounter';
import { ResultsScreen } from '@/components/ResultsScreen';
import { RestaurantDetail } from '@/components/RestaurantDetail';

export default function HomePage() {
  const { restaurants, loading, error, userLocation } = useRestaurants();
  const { handleSwipe: recordPreference, getScoredRestaurants, resetPreferences } = usePersonalization();
  const {
    swipeCount: sprintSwipeCount,
    sprintSize,
    likedRestaurants,
    isComplete,
    bestMatch,
    recordSwipe: recordSprintSwipe,
    resetSprint,
    allSwipedIds,
    progress,
  } = useSprint();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // CRITICAL FIX: Lock the restaurant deck at the start of each sprint
  // This prevents re-ranking during swipes which causes the "next card" to change mid-swipe
  const sprintDeckRef = useRef<Restaurant[]>([]);
  const sprintStartedRef = useRef(false);

  // Get scored and filtered restaurants (for initial ranking only)
  const scoredRestaurants = useMemo(() => {
    if (restaurants.length === 0) return [];
    return getScoredRestaurants(restaurants, allSwipedIds);
  }, [restaurants, getScoredRestaurants, allSwipedIds]);

  // Lock the sprint deck when starting a new sprint or when restaurants first load
  useEffect(() => {
    // Only update the deck if:
    // 1. Sprint just completed (isComplete is true) - wait for reset
    // 2. We have restaurants but deck is empty - initial load
    // 3. Sprint was reset (currentIndex === 0 and swipe count === 0)
    const shouldUpdateDeck =
      (!isComplete && sprintSwipeCount === 0 && (sprintDeckRef.current.length === 0 || currentIndex === 0)) ||
      (scoredRestaurants.length > 0 && sprintDeckRef.current.length === 0);

    if (shouldUpdateDeck) {
      sprintDeckRef.current = [...scoredRestaurants];
      sprintStartedRef.current = true;
    }
  }, [scoredRestaurants, isComplete, sprintSwipeCount, currentIndex]);

  // Use the locked sprint deck instead of live-updating scoredRestaurants
  const activeDeck = sprintDeckRef.current;

  // Handle swipe action
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const restaurant = activeDeck[currentIndex];
    if (!restaurant) return;

    const liked = direction === 'right';
    recordPreference(restaurant, liked);
    recordSprintSwipe(restaurant, liked);
    setCurrentIndex(prev => prev + 1);
  }, [activeDeck, currentIndex, recordPreference, recordSprintSwipe]);

  // Handle retry (new sprint, keep preferences)
  const handleRetry = useCallback(() => {
    resetSprint();
    setCurrentIndex(0);
  }, [resetSprint]);

  // Handle full reset
  const handleResetTaste = useCallback(() => {
    resetPreferences();
    resetSprint();
    setCurrentIndex(0);
  }, [resetPreferences, resetSprint]);

  // Handle restaurant selection
  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-10 h-10 border-[3px] border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Finding restaurants near you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-5">😕</div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-zinc-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No restaurants left
  if (activeDeck.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-5">🍽️</div>
          <h1 className="text-xl font-bold text-white mb-2">No more restaurants</h1>
          <p className="text-zinc-400 text-sm mb-6">You've seen all the restaurants!</p>
          <button
            onClick={handleResetTaste}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
          >
            Start Fresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Sprint Counter */}
      <SprintCounter
        current={sprintSwipeCount}
        total={sprintSize}
        progress={progress}
      />

      {/* Swipe Deck */}
      <div className="fixed inset-0 pt-14 pb-24">
        <SwipeDeck
          restaurants={activeDeck}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
          userLat={userLocation.latitude}
          userLon={userLocation.longitude}
          isDefaultLocation={userLocation.isDefault}
        />
      </div>

      {/* Actions Bar */}
      {!isComplete && (
        <ActionsBar
          onDislike={() => handleSwipe('left')}
          onLike={() => handleSwipe('right')}
        />
      )}

      {/* Results Screen */}
      <AnimatePresence>
        {isComplete && (
          <ResultsScreen
            bestMatch={bestMatch}
            likedRestaurants={likedRestaurants}
            onRetry={handleRetry}
            onResetTaste={handleResetTaste}
            onSelectRestaurant={handleSelectRestaurant}
            userLat={userLocation.latitude}
            userLon={userLocation.longitude}
          />
        )}
      </AnimatePresence>

      {/* Restaurant Detail Modal */}
      <AnimatePresence>
        {selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            userLat={userLocation.latitude}
            userLon={userLocation.longitude}
            isDefaultLocation={userLocation.isDefault}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

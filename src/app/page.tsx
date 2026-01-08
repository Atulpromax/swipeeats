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
import { SkeletonCard } from '@/components/SkeletonCard';

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

  // FIX: Track if we've ever loaded restaurants (to prevent showing empty state on first load)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Mark when restaurants first load
  useEffect(() => {
    if (restaurants.length > 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [restaurants, hasLoadedOnce]);

  // Lock the restaurant deck at the start of each sprint
  const sprintDeckRef = useRef<Restaurant[]>([]);
  const sprintStartedRef = useRef(false);

  // Get scored and filtered restaurants
  const scoredRestaurants = useMemo(() => {
    if (restaurants.length === 0) return [];
    return getScoredRestaurants(restaurants, allSwipedIds);
  }, [restaurants, getScoredRestaurants, allSwipedIds]);

  // Lock the sprint deck when starting a new sprint
  useEffect(() => {
    const shouldUpdateDeck =
      (!isComplete && sprintSwipeCount === 0 && (sprintDeckRef.current.length === 0 || currentIndex === 0)) ||
      (scoredRestaurants.length > 0 && sprintDeckRef.current.length === 0);

    if (shouldUpdateDeck) {
      sprintDeckRef.current = [...scoredRestaurants];
      sprintStartedRef.current = true;
    }
  }, [scoredRestaurants, isComplete, sprintSwipeCount, currentIndex]);

  // Use the locked sprint deck
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

  // Handle retry (new sprint)
  const handleRetry = useCallback(() => {
    resetSprint();
    setCurrentIndex(0);
    // Immediately rebuild deck from scored restaurants
    sprintDeckRef.current = [...scoredRestaurants];
  }, [resetSprint, scoredRestaurants]);

  // Handle full reset
  const handleResetTaste = useCallback(() => {
    resetPreferences();
    resetSprint();
    setCurrentIndex(0);
    // Deck will rebuild on next render via useEffect
    sprintDeckRef.current = [];
  }, [resetPreferences, resetSprint]);

  // Handle restaurant selection
  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  // LOADING STATE: Show skeleton while loading
  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 overflow-hidden">
        {/* Skeleton Counter */}
        <div className="fixed top-4 right-4 z-50">
          <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse" />
        </div>

        {/* Skeleton Card */}
        <div className="fixed inset-0 pb-24">
          <div className="relative w-full h-full">
            <SkeletonCard />
          </div>
        </div>

        {/* Skeleton Actions */}
        <div
          className="fixed left-0 right-0 bottom-0 z-40 flex justify-center gap-8 px-4 py-4"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <div className="w-16 h-16 rounded-full bg-zinc-800 animate-pulse" />
          <div className="w-16 h-16 rounded-full bg-zinc-800 animate-pulse" />
        </div>
      </main>
    );
  }

  // ERROR STATE
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

  // EMPTY STATE: Only show if we've loaded once AND deck is truly empty (not first load)
  if (hasLoadedOnce && activeDeck.length === 0 && !isComplete && scoredRestaurants.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-5">🍽️</div>
          <h1 className="text-xl font-bold text-white mb-2">No more restaurants</h1>
          <p className="text-zinc-400 text-sm mb-6">You&apos;ve seen all the restaurants!</p>
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
      <div className="fixed inset-0 pb-24">
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

'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Restaurant } from '@/types';
import { RestaurantCard } from './RestaurantCard';

interface SwipeDeckProps {
    restaurants: Restaurant[];
    currentIndex: number;
    onSwipe: (direction: 'left' | 'right') => void;
    userLat: number;
    userLon: number;
    isDefaultLocation: boolean;
}

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;
const PRELOAD_COUNT = 5; // Preload images for next 5 cards

// Memoized background card for performance
const BackgroundCard = memo(function BackgroundCard({
    restaurant,
    userLat,
    userLon,
    isDefaultLocation,
    index
}: {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
    isDefaultLocation: boolean;
    index: number;
}) {
    return (
        <div className="w-full h-full rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
            <RestaurantCard
                key={`bg-${restaurant.name}-${index}`}
                restaurant={restaurant}
                userLat={userLat}
                userLon={userLon}
                isDefaultLocation={isDefaultLocation}
                isActive={false}
            />
        </div>
    );
});

export const SwipeDeck = memo(function SwipeDeck({
    restaurants,
    currentIndex,
    onSwipe,
    userLat,
    userLon,
    isDefaultLocation,
}: SwipeDeckProps) {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-12, 12]);

    // Swipe indicators
    const likeOpacity = useTransform(x, [0, 80], [0, 1]);
    const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

    // Touch tracking refs
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const lastTouchRef = useRef<{ x: number; time: number } | null>(null);
    const isHorizontalSwipeRef = useRef<boolean | null>(null);

    // Get current and next restaurants (only render top 2)
    const currentRestaurant = restaurants[currentIndex];
    const nextRestaurant = restaurants[currentIndex + 1];

    // Preload images for next N cards (runs in background)
    useEffect(() => {
        const imagesToPreload = restaurants
            .slice(currentIndex + 1, currentIndex + 1 + PRELOAD_COUNT)
            .flatMap(r => r.image_urls?.slice(0, 2) || [])
            .filter(Boolean);

        imagesToPreload.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, [currentIndex, restaurants]);

    // FIX: Reset position when currentIndex changes (especially on retry when it goes back to 0)
    useEffect(() => {
        x.set(0);
        setIsAnimatingOut(false);
        setIsDragging(false);
    }, [currentIndex, x]);

    const performSwipe = useCallback((direction: 'left' | 'right') => {
        if (isAnimatingOut) return;
        setIsAnimatingOut(true);

        // Call onSwipe IMMEDIATELY for instant feedback
        onSwipe(direction);

        const targetX = direction === 'right' ? 400 : -400;

        animate(x, targetX, {
            type: 'spring',
            stiffness: 800,  // Much faster
            damping: 40,
            onComplete: () => {
                x.set(0);
                setIsAnimatingOut(false);
            },
        });
    }, [x, onSwipe, isAnimatingOut]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnimatingOut) return;
            if (e.key === 'ArrowLeft') performSwipe('left');
            if (e.key === 'ArrowRight') performSwipe('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnimatingOut, performSwipe]);

    // Touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (isAnimatingOut) return;
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        lastTouchRef.current = { x: touch.clientX, time: Date.now() };
        isHorizontalSwipeRef.current = null;
    }, [isAnimatingOut]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current || isAnimatingOut) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;

        if (isHorizontalSwipeRef.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
            isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (isHorizontalSwipeRef.current) {
            e.preventDefault();
            setIsDragging(true);
            x.set(deltaX);
            lastTouchRef.current = { x: touch.clientX, time: Date.now() };
        }
    }, [x, isAnimatingOut]);

    const handleTouchEnd = useCallback(() => {
        if (!touchStartRef.current || !lastTouchRef.current) {
            touchStartRef.current = null;
            isHorizontalSwipeRef.current = null;
            setIsDragging(false);
            return;
        }

        if (isAnimatingOut || !isHorizontalSwipeRef.current) {
            animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
            touchStartRef.current = null;
            isHorizontalSwipeRef.current = null;
            setIsDragging(false);
            return;
        }

        const currentX = x.get();
        const velocity = (lastTouchRef.current.x - touchStartRef.current.x) /
            (lastTouchRef.current.time - touchStartRef.current.time);

        const shouldSwipe = Math.abs(currentX) > SWIPE_THRESHOLD || Math.abs(velocity) > VELOCITY_THRESHOLD;

        if (shouldSwipe) {
            const direction = currentX > 0 ? 'right' : 'left';
            performSwipe(direction);
        } else {
            animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
        }

        touchStartRef.current = null;
        lastTouchRef.current = null;
        isHorizontalSwipeRef.current = null;
        setIsDragging(false);
    }, [x, performSwipe, isAnimatingOut]);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isAnimatingOut) return;
        touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        lastTouchRef.current = { x: e.clientX, time: Date.now() };
        isHorizontalSwipeRef.current = null;
        setIsDragging(true);
    }, [isAnimatingOut]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!touchStartRef.current || !isDragging || isAnimatingOut) return;

        const deltaX = e.clientX - touchStartRef.current.x;
        const deltaY = e.clientY - touchStartRef.current.y;

        if (isHorizontalSwipeRef.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
            isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (isHorizontalSwipeRef.current) {
            x.set(deltaX);
            lastTouchRef.current = { x: e.clientX, time: Date.now() };
        }
    }, [x, isDragging, isAnimatingOut]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        handleTouchEnd();
    }, [isDragging, handleTouchEnd]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            handleTouchEnd();
        }
    }, [isDragging, handleTouchEnd]);

    if (!currentRestaurant) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <span className="text-5xl">🍽️</span>
                <p className="text-zinc-400 text-lg">No more restaurants</p>
                <p className="text-zinc-500 text-sm">You&apos;ve seen all the restaurants!</p>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >

            {/* Next card - full opacity, ready immediately */}
            {nextRestaurant && (
                <div className="absolute inset-4 scale-[0.97] z-10">
                    <BackgroundCard
                        restaurant={nextRestaurant}
                        userLat={userLat}
                        userLon={userLon}
                        isDefaultLocation={isDefaultLocation}
                        index={currentIndex + 1}
                    />
                </div>
            )}

            {/* Current card - uses GPU-accelerated transforms */}
            <motion.div
                key={`current-${currentRestaurant.name}-${currentIndex}`}
                className="absolute inset-4 z-20"
                style={{
                    x,
                    rotate,
                    willChange: 'transform', // GPU hint
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
            >
                {/* NOPE indicator */}
                <motion.div
                    className="absolute top-20 left-8 z-50 px-5 py-2.5 rounded-xl border-4 border-red-500 bg-red-500/30 backdrop-blur-sm"
                    style={{ opacity: nopeOpacity, rotate: -15 }}
                >
                    <span className="text-2xl font-black text-red-500">NOPE</span>
                </motion.div>

                {/* LIKE indicator */}
                <motion.div
                    className="absolute top-20 right-8 z-50 px-5 py-2.5 rounded-xl border-4 border-emerald-400 bg-emerald-400/30 backdrop-blur-sm"
                    style={{ opacity: likeOpacity, rotate: 15 }}
                >
                    <span className="text-2xl font-black text-emerald-400">LIKE</span>
                </motion.div>

                {/* Card */}
                <div className="w-full h-full">
                    <RestaurantCard
                        restaurant={currentRestaurant}
                        userLat={userLat}
                        userLon={userLon}
                        isDefaultLocation={isDefaultLocation}
                        isActive={true}
                    />
                </div>
            </motion.div>
        </div>
    );
});

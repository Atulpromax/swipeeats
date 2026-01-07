'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '@/types';
import { formatDistance, getDirectionsUrl } from '@/utils/location';
import { LikedList } from './LikedList';

interface ResultsScreenProps {
    bestMatch: Restaurant | null;
    likedRestaurants: Restaurant[];
    onRetry: () => void;
    onResetTaste: () => void;
    onSelectRestaurant: (restaurant: Restaurant) => void;
    userLat: number;
    userLon: number;
}

export function ResultsScreen({
    bestMatch,
    likedRestaurants,
    onRetry,
    onResetTaste,
    onSelectRestaurant,
    userLat,
    userLon,
}: ResultsScreenProps) {
    const [showLikedList, setShowLikedList] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const heroImage = bestMatch?.image_urls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

    const formatPrice = (price: number) => {
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}k`;
        return `₹${price}`;
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Confetti */}
            {showConfetti && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                background: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][i % 5],
                            }}
                            initial={{ y: -10, opacity: 1 }}
                            animate={{ y: '100vh', opacity: 0, rotate: 360 }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: Math.random() * 0.5,
                                ease: 'easeIn',
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="min-h-full flex flex-col">
                {/* Header */}
                <motion.div
                    className="text-center py-8"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        className="text-4xl mb-3"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: 2, duration: 0.4, delay: 0.3 }}
                    >
                        🎉
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white mb-1">Sprint Complete!</h1>
                    <p className="text-zinc-500">
                        You liked {likedRestaurants.length} restaurant{likedRestaurants.length !== 1 ? 's' : ''}
                    </p>
                </motion.div>

                {/* Best Match Card */}
                {bestMatch && (
                    <motion.div
                        className="mx-4 mb-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    >
                        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                            {/* Image */}
                            <div className="relative h-48">
                                <img
                                    src={heroImage}
                                    alt={bestMatch.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                                {/* Best Match badge */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 rounded-full">
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs font-bold text-white">Best Match</span>
                                </div>

                                {/* Rating */}
                                {bestMatch.rating > 0 && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-full">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-xs font-bold text-white">{bestMatch.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h2 className="text-xl font-bold text-white mb-2">{bestMatch.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                                    <span>{formatPrice(bestMatch.price_for_two)} for two</span>
                                    <span>•</span>
                                    <span>{formatDistance(bestMatch.distance || 999)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const url = getDirectionsUrl(
                                                userLat, userLon,
                                                bestMatch.latitude, bestMatch.longitude,
                                                bestMatch.name
                                            );
                                            window.open(url, '_blank');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 rounded-xl text-white font-medium active:scale-95 transition-transform"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Directions
                                    </button>
                                    {bestMatch.url && (
                                        <button
                                            onClick={() => window.open(bestMatch.url, '_blank')}
                                            className="px-4 py-3 bg-zinc-800 rounded-xl text-white active:scale-95 transition-transform"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Liked List Toggle */}
                {likedRestaurants.length > 0 && (
                    <motion.div
                        className="px-4 flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <button
                            onClick={() => setShowLikedList(!showLikedList)}
                            className="w-full py-3 flex items-center justify-center gap-2 text-zinc-500"
                        >
                            <span className="text-sm">View all {likedRestaurants.length} liked</span>
                            <motion.svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                animate={{ rotate: showLikedList ? 180 : 0 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </button>

                        <AnimatePresence>
                            {showLikedList && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <LikedList restaurants={likedRestaurants} onSelect={onSelectRestaurant} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Bottom Actions */}
                <motion.div
                    className="sticky bottom-0 p-4 bg-zinc-950 border-t border-zinc-900"
                    style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex gap-3">
                        <button
                            onClick={onResetTaste}
                            className="px-6 py-3.5 bg-zinc-800 rounded-xl text-zinc-300 font-medium active:scale-95 transition-transform"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onRetry}
                            className="flex-1 py-3.5 bg-emerald-500 rounded-xl text-white font-bold active:scale-95 transition-transform"
                        >
                            Start New Sprint
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

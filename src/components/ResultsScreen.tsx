'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Restaurant } from '@/types';
import { getDirectionsUrl } from '@/utils/location';

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
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    const heroImage = bestMatch?.image_urls?.[0] || '/placeholder-restaurant.jpg';

    // Filter out best match from liked list
    const otherLiked = likedRestaurants.filter(r => r.name !== bestMatch?.name);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-[#1a1a2e] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Confetti Particles */}
            {showConfetti && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                width: Math.random() * 8 + 4,
                                height: Math.random() * 8 + 4,
                                background: ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b'][i % 5],
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            }}
                            initial={{ y: -20, opacity: 1, rotate: 0 }}
                            animate={{
                                y: '110vh',
                                opacity: [1, 1, 0],
                                rotate: Math.random() * 720 - 360,
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: Math.random() * 0.8,
                                ease: 'easeIn',
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="min-h-full flex flex-col px-4 pb-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-center py-4 relative"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <button
                        onClick={onRetry}
                        className="absolute left-0 p-2 text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-white">Results</h1>
                </motion.div>

                {/* Winner Card */}
                {bestMatch && (
                    <motion.div
                        className="relative mb-6"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        {/* Winner Badge */}
                        <div className="flex justify-center mb-[-16px] z-10 relative">
                            <div
                                className="px-6 py-1.5 rounded-full text-sm font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
                                    color: '#1a1a2e',
                                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
                                }}
                            >
                                Winner
                            </div>
                        </div>

                        {/* Card with Golden Border */}
                        <div
                            className="rounded-2xl overflow-hidden p-[3px]"
                            style={{
                                background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #ffd700 100%)',
                                boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
                                {/* Image */}
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={heroImage}
                                        alt={bestMatch.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 600px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="p-4 text-center -mt-8 relative">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className="text-lg">👑</span>
                                        <span className="text-zinc-400 text-sm">Best Match:</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">{bestMatch.name}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-4">
                            {/* Call Button */}
                            {bestMatch.phone && (
                                <a
                                    href={`tel:${bestMatch.phone}`}
                                    className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center transition-all hover:bg-blue-400/10 active:scale-95"
                                >
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </a>
                            )}

                            {/* Directions Button */}
                            <a
                                href={getDirectionsUrl(userLat, userLon, bestMatch.latitude, bestMatch.longitude, bestMatch.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full border-2 border-purple-400 flex items-center justify-center transition-all hover:bg-purple-400/10 active:scale-95"
                            >
                                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </a>

                            {/* Zomato Button */}
                            {bestMatch.url && (
                                <a
                                    href={bestMatch.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 h-12 rounded-full bg-[#e23744] flex items-center justify-center text-white font-bold text-sm transition-all hover:bg-[#c42e3a] active:scale-95"
                                >
                                    zomato
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Other Liked Restaurants */}
                {otherLiked.length > 0 && (
                    <motion.div
                        className="flex-1 space-y-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {otherLiked.map((restaurant, idx) => (
                            <motion.div
                                key={restaurant.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                onClick={() => onSelectRestaurant(restaurant)}
                                className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 cursor-pointer transition-all hover:bg-blue-500/10 active:scale-[0.98]"
                                style={{
                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
                                }}
                            >
                                {/* Image */}
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                                    {restaurant.image_urls?.[0] && (
                                        <Image
                                            src={restaurant.image_urls[0]}
                                            alt={restaurant.name}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate">{restaurant.name}</h3>
                                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                                        <span>⭐</span>
                                        <span>{restaurant.rating} stars</span>
                                    </div>
                                </div>

                                {/* Action Icons */}
                                <div className="flex items-center gap-2">
                                    <a
                                        href={getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center text-zinc-400 hover:border-purple-400 hover:text-purple-400 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectRestaurant(restaurant);
                                        }}
                                        className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center text-zinc-400 hover:border-blue-400 hover:text-blue-400 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="2" />
                                            <circle cx="12" cy="5" r="2" />
                                            <circle cx="12" cy="19" r="2" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* No likes message */}
                {likedRestaurants.length === 0 && (
                    <motion.div
                        className="flex-1 flex flex-col items-center justify-center text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="text-6xl mb-4">😢</span>
                        <h2 className="text-xl font-bold text-white mb-2">No restaurants liked</h2>
                        <p className="text-zinc-500">Try swiping right on some restaurants!</p>
                    </motion.div>
                )}

                {/* Bottom Actions */}
                <motion.div
                    className="mt-6 pt-4"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex gap-3">
                        <button
                            onClick={onResetTaste}
                            className="px-6 py-3.5 bg-zinc-800 rounded-xl text-zinc-300 font-medium active:scale-95 transition-transform border border-zinc-700"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onRetry}
                            className="flex-1 py-3.5 rounded-xl text-white font-bold active:scale-95 transition-transform"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            }}
                        >
                            Start New Sprint
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

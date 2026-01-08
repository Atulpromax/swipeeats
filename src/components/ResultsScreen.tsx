'use client';

import { motion } from 'framer-motion';
import { Restaurant } from '@/types';
import { WinnerHero, ActionButtons, MatchesList } from './results';

// Design tokens
const SPACING = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

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
    // Filter out best match from other matches
    const otherMatches = likedRestaurants.filter(r => r.name !== bestMatch?.name);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-zinc-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Scrollable Content Area */}
            <div
                className="h-full overflow-y-auto overscroll-contain"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* Header */}
                <motion.header
                    className="sticky top-0 z-20 flex items-center justify-between bg-zinc-950/95 backdrop-blur-sm"
                    style={{
                        paddingTop: 'max(12px, env(safe-area-inset-top))',
                        paddingBottom: SPACING.md,
                        paddingLeft: SPACING.lg,
                        paddingRight: SPACING.lg,
                    }}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Back Arrow */}
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center"
                        style={{ width: 44, height: 44, marginLeft: -8 }}
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <h1 className="text-lg font-semibold text-white">Your Match</h1>

                    {/* Retry button (replaces Reset) */}
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
                        style={{ height: 44, paddingLeft: 8, paddingRight: 8 }}
                    >
                        Retry
                    </button>
                </motion.header>

                {/* Main Content */}
                <div style={{ padding: SPACING.xl }}>
                    {/* Winner Section */}
                    {bestMatch ? (
                        <>
                            <WinnerHero
                                restaurant={bestMatch}
                                userLat={userLat}
                                userLon={userLon}
                            />
                            <ActionButtons
                                restaurant={bestMatch}
                                userLat={userLat}
                                userLon={userLon}
                            />
                        </>
                    ) : (
                        <motion.div
                            className="flex flex-col items-center justify-center text-center"
                            style={{ paddingTop: 64, paddingBottom: 64 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <span className="text-5xl mb-4">🤔</span>
                            <h2 className="text-xl font-semibold text-white mb-2">No matches yet</h2>
                            <p className="text-zinc-400 text-sm">Swipe right on restaurants you like!</p>
                        </motion.div>
                    )}

                    {/* Other Matches */}
                    <MatchesList
                        restaurants={otherMatches}
                        onSelect={onSelectRestaurant}
                    />
                </div>
            </div>
        </motion.div>
    );
}

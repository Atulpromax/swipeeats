'use client';

import { motion } from 'framer-motion';
import { Restaurant } from '@/types';
import { MatchRow } from './MatchRow';

// Design tokens
const SPACING = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

interface MatchesListProps {
    restaurants: Restaurant[];
    onSelect: (restaurant: Restaurant) => void;
}

export function MatchesList({ restaurants, onSelect }: MatchesListProps) {
    if (restaurants.length === 0) return null;

    return (
        <motion.div
            style={{ marginTop: SPACING.xxxl }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
        >
            {/* Section Header */}
            <div
                className="flex items-center justify-between"
                style={{ marginBottom: SPACING.lg }}
            >
                <h3
                    className="text-zinc-400 font-semibold uppercase tracking-wider"
                    style={{ fontSize: 12 }}
                >
                    Liked Restaurants
                </h3>
                <span
                    className="text-zinc-500 font-medium"
                    style={{ fontSize: 12 }}
                >
                    {restaurants.length}
                </span>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
                {restaurants.map((restaurant, idx) => (
                    <motion.div
                        key={restaurant.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + idx * 0.05, duration: 0.2 }}
                    >
                        <MatchRow restaurant={restaurant} onSelect={onSelect} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

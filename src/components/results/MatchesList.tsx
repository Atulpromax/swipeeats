'use client';

import { motion } from 'framer-motion';
import { Restaurant } from '@/types';
import { MatchRow } from './MatchRow';

interface MatchesListProps {
    restaurants: Restaurant[];
    onSelect: (restaurant: Restaurant) => void;
}

export function MatchesList({ restaurants, onSelect }: MatchesListProps) {
    if (restaurants.length === 0) return null;

    return (
        <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
        >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                    Other Matches
                </h3>
                <span className="text-sm text-zinc-500">{restaurants.length}</span>
            </div>

            {/* List */}
            <div className="space-y-2">
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

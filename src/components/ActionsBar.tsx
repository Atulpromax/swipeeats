'use client';

import { motion } from 'framer-motion';

interface ActionsBarProps {
    onDislike: () => void;
    onLike: () => void;
}

export function ActionsBar({ onDislike, onLike }: ActionsBarProps) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 flex justify-center gap-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/50"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
            {/* Dislike button */}
            <motion.button
                onClick={onDislike}
                className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-red-500/50 flex items-center justify-center shadow-lg"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
            >
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </motion.button>

            {/* Like button */}
            <motion.button
                onClick={onLike}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
            >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </motion.button>
        </div>
    );
}

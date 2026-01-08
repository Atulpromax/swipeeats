'use client';

import { motion } from 'framer-motion';

interface ActionsBarProps {
    onDislike: () => void;
    onLike: () => void;
}

export function ActionsBar({ onDislike, onLike }: ActionsBarProps) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40"
            style={{
                paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                paddingTop: 16,
                paddingLeft: 24,
                paddingRight: 24,
                // Subtle gradient to separate from content
                background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(9,9,11,0.98) 60%, rgba(9,9,11,0) 100%)',
            }}
        >
            <div className="flex justify-center items-center gap-8">
                {/* Dislike button */}
                <motion.button
                    onClick={onDislike}
                    className="flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(39, 39, 42, 0.8)',
                        border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    }}
                >
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>

                {/* Like button */}
                <motion.button
                    onClick={onLike}
                    className="flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
                    }}
                >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </motion.button>
            </div>
        </div>
    );
}

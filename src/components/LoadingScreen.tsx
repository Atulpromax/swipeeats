'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
            {/* Logo Container */}
            <motion.div
                className="flex flex-col items-center gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* Animated Logo */}
                <div className="relative">
                    {/* Outer ring pulse */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-emerald-500/20"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{ width: 120, height: 120 }}
                    />

                    {/* Main logo circle */}
                    <motion.div
                        className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                            boxShadow: '0 0 60px rgba(16, 185, 129, 0.4), 0 0 100px rgba(16, 185, 129, 0.2)',
                        }}
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        {/* Fork & Spoon Icon */}
                        <motion.div
                            className="text-5xl"
                            animate={{
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            🍽️
                        </motion.div>
                    </motion.div>
                </div>

                {/* App Name */}
                <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold tracking-tight">
                        <span className="text-white">Swipe</span>
                        <span className="text-emerald-400">Eats</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">
                        Find your next meal
                    </p>
                </motion.div>

                {/* Loading Dots */}
                <motion.div
                    className="flex gap-2 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 rounded-full bg-emerald-500"
                            animate={{
                                y: [0, -12, 0],
                                opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>

            {/* Bottom tagline */}
            <motion.p
                className="absolute bottom-12 text-zinc-600 text-xs font-medium tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
                DISCOVER • SWIPE • DINE
            </motion.p>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';

interface SprintCounterProps {
    current: number;
    total: number;
    progress: number;
}

export function SprintCounter({ current, total, progress }: SprintCounterProps) {
    // Calculate circle parameters
    const size = 48;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg
                    className="transform -rotate-90"
                    width={size}
                    height={size}
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Counter */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        key={current}
                        className="text-white text-sm font-bold"
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {current}
                    </motion.span>
                </div>
            </div>
        </div>
    );
}

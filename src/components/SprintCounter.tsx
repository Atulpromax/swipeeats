'use client';

import { motion } from 'framer-motion';

interface SprintCounterProps {
    current: number;
    total: number;
    progress: number;
}

export function SprintCounter({ current, total, progress }: SprintCounterProps) {
    // Smaller size - half of previous
    const size = 28;
    const strokeWidth = 2.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        // Centered at the top
        <div
            className="fixed z-50 flex justify-center"
            style={{
                top: 16,
                left: 0,
                right: 0,
            }}
        >
            <div
                className="relative bg-black/40 backdrop-blur-sm rounded-full"
                style={{
                    width: size + 8,
                    height: size + 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
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
                            stroke="rgba(255, 255, 255, 0.15)"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#10b981"
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </svg>

                    {/* Center Counter */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            key={current}
                            className="text-white font-semibold"
                            style={{ fontSize: 10 }}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {current}
                        </motion.span>
                    </div>
                </div>
            </div>
        </div>
    );
}

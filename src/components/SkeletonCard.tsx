'use client';

import { motion } from 'framer-motion';

export function SkeletonCard() {
    return (
        <div className="absolute inset-4 rounded-3xl overflow-hidden bg-zinc-900">
            {/* Shimmer Animation */}
            <div className="relative w-full h-full">
                {/* Hero Skeleton */}
                <div className="relative w-full aspect-[3/4] bg-zinc-800">
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                        }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Top badges skeleton */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                        <div className="w-16 h-8 rounded-xl bg-zinc-700" />
                        <div className="w-16 h-8 rounded-xl bg-zinc-700" />
                    </div>

                    {/* Bottom text skeleton */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="w-3/4 h-7 rounded-lg bg-zinc-700 mb-3" />
                        <div className="w-2/3 h-4 rounded bg-zinc-700" />
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="p-5 space-y-5 bg-zinc-900">
                    {/* CTA skeleton */}
                    <div className="w-full h-14 rounded-2xl bg-zinc-800" />
                    <div className="flex gap-3">
                        <div className="flex-1 h-12 rounded-2xl bg-zinc-800" />
                        <div className="flex-1 h-12 rounded-2xl bg-zinc-800" />
                    </div>

                    {/* Chips skeleton */}
                    <div className="flex gap-2">
                        <div className="w-20 h-8 rounded-full bg-zinc-800" />
                        <div className="w-24 h-8 rounded-full bg-zinc-800" />
                        <div className="w-16 h-8 rounded-full bg-zinc-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}

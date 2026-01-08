'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Restaurant } from '@/types';
import { formatDistance, getDirectionsUrl } from '@/utils/location';

interface WinnerHeroProps {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
}

export function WinnerHero({ restaurant, userLat, userLon }: WinnerHeroProps) {
    const heroImage = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            {/* Hero Image */}
            <div className="relative aspect-[4/3] w-full">
                <Image
                    src={heroImage}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                />

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 100%)'
                    }}
                />

                {/* Winner Badge */}
                <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm">
                        <span className="text-sm">🏆</span>
                        <span className="text-xs font-semibold text-black uppercase tracking-wide">Winner</span>
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    {/* Restaurant Name */}
                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {restaurant.name}
                    </h2>

                    {/* Metadata Row */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-white/80">
                        {/* Rating */}
                        <span className="flex items-center gap-1">
                            <span className="text-amber-400">★</span>
                            <span className="font-medium text-white">{restaurant.rating}</span>
                        </span>

                        <span className="text-white/40">•</span>

                        {/* Cuisine */}
                        <span>{restaurant.cuisine || 'Multi-cuisine'}</span>

                        <span className="text-white/40">•</span>

                        {/* Price */}
                        <span>₹{restaurant.price_for_two} for two</span>

                        <span className="text-white/40">•</span>

                        {/* Distance */}
                        <span>{distance}</span>
                    </div>

                    {/* Area */}
                    <p className="text-sm text-white/60 mt-1">{restaurant.area}</p>
                </div>
            </div>
        </motion.div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Restaurant } from '@/types';
import { formatDistance } from '@/utils/location';

// Design tokens for consistency
const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

interface WinnerHeroProps {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
}

export function WinnerHero({ restaurant, userLat, userLon }: WinnerHeroProps) {
    const heroImage = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);

    // Format price nicely
    const formatPrice = (price: number) => {
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}k`;
        return `₹${price}`;
    };

    // Get display category - cuisine first, then ambiance tag
    const getDisplayCategory = () => {
        if (restaurant.cuisine) {
            const first = restaurant.cuisine.split(',')[0].trim();
            if (first) return first;
        }
        if (restaurant.ambiance_tags?.length > 0) {
            return restaurant.ambiance_tags[0];
        }
        return 'Dining';
    };

    return (
        <motion.div
            className="relative overflow-hidden"
            style={{ borderRadius: RADIUS.xxl }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            {/* Hero Image - 70% of viewport height */}
            <div
                className="relative w-full"
                style={{ height: '70vh', minHeight: '400px' }}
            >
                <Image
                    src={heroImage}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                />

                {/* Gradient Overlay - Stronger at bottom */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
                            linear-gradient(180deg, 
                                rgba(0,0,0,0.3) 0%, 
                                rgba(0,0,0,0) 25%,
                                rgba(0,0,0,0) 40%,
                                rgba(0,0,0,0.5) 60%,
                                rgba(0,0,0,0.9) 100%
                            )
                        `
                    }}
                />

                {/* Winner Badge - Top Left */}
                <div
                    className="absolute z-10"
                    style={{ top: SPACING.lg, left: SPACING.lg }}
                >
                    <div
                        className="flex items-center gap-2 bg-amber-500 backdrop-blur-sm"
                        style={{
                            padding: `${SPACING.sm}px ${SPACING.md}px`,
                            borderRadius: RADIUS.md,
                        }}
                    >
                        <span className="text-sm">🏆</span>
                        <span className="text-xs font-bold text-black uppercase tracking-wider">Winner</span>
                    </div>
                </div>

                {/* Content Overlay at Bottom */}
                <div
                    className="absolute bottom-0 left-0 right-0 z-10"
                    style={{ padding: SPACING.xl }}
                >
                    {/* Restaurant Name */}
                    <h2
                        className="text-white text-2xl font-bold leading-tight"
                        style={{
                            marginBottom: SPACING.md,
                            textShadow: '0 2px 12px rgba(0,0,0,0.6)'
                        }}
                    >
                        {restaurant.name}
                    </h2>

                    {/* Meta Row 1: Rating + Cuisine + Price */}
                    <div
                        className="flex items-center flex-wrap gap-x-2 text-white/90"
                        style={{ marginBottom: SPACING.xs }}
                    >
                        {/* Rating Badge */}
                        <span className="flex items-center gap-1">
                            <span className="text-amber-400 text-sm">★</span>
                            <span className="text-sm font-semibold">{restaurant.rating?.toFixed(1)}</span>
                        </span>

                        <span className="text-white/40 text-sm">•</span>

                        {/* Cuisine */}
                        <span className="text-sm">{getDisplayCategory()}</span>

                        <span className="text-white/40 text-sm">•</span>

                        {/* Price */}
                        <span className="text-sm">{formatPrice(restaurant.price_for_two)} for two</span>

                        <span className="text-white/40 text-sm">•</span>

                        {/* Distance */}
                        <span className="text-sm">{distance}</span>
                    </div>

                    {/* Meta Row 2: Area */}
                    <p className="text-sm text-white/70">{restaurant.area}</p>
                </div>
            </div>
        </motion.div>
    );
}

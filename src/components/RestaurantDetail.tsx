'use client';

import { Restaurant } from '@/types';
import { formatDistance, getDirectionsUrl } from '@/utils/location';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

// Design tokens for consistency
const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

interface RestaurantDetailProps {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
    isDefaultLocation: boolean;
    onClose: () => void;
}

export function RestaurantDetail({
    restaurant,
    userLat,
    userLon,
    isDefaultLocation,
    onClose,
}: RestaurantDetailProps) {
    const [imageError, setImageError] = useState(false);
    const heroImage = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);
    const directionsUrl = getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name);

    // Parse ambiance tags (move before getDisplayCategory so it can use ambianceTags)
    const ambianceTags = restaurant.ambiance_tags || [];
    const visibleTags = ambianceTags.slice(0, 4);
    const remainingCount = Math.max(0, ambianceTags.length - 4);

    // Get display category - cuisine first, then ambiance tag
    const getDisplayCategory = () => {
        if (restaurant.cuisine) {
            const first = restaurant.cuisine.split(',')[0].trim();
            if (first) return first;
        }
        if (ambianceTags.length > 0) {
            return ambianceTags[0];
        }
        return 'Dining';
    };

    // Format price nicely
    const formatPrice = (price: number) => {
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}k`;
        return `₹${price}`;
    };

    // Filter REAL photos only 
    const galleryPhotos = (restaurant.image_urls || [])
        .slice(1, 7)
        .filter(url =>
            url &&
            !url.includes('placeholder') &&
            !url.toLowerCase().includes('zomato') &&
            !url.toLowerCase().includes('brand') &&
            !url.toLowerCase().includes('logo') &&
            !url.includes('o2_assets')
        );

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-zinc-950"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
            {/* Scrollable Content */}
            <div
                className="h-full overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Hero Image Section */}
                <div className="relative w-full" style={{ height: '55vh', minHeight: '320px' }}>
                    {!imageError ? (
                        <Image
                            src={heroImage}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-7xl">🍽️</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `
                                linear-gradient(180deg, 
                                    rgba(0,0,0,0.4) 0%, 
                                    rgba(0,0,0,0) 25%,
                                    rgba(0,0,0,0) 45%,
                                    rgba(0,0,0,0.6) 70%,
                                    rgba(0,0,0,0.95) 100%
                                )
                            `
                        }}
                    />

                    {/* Back Button */}
                    <button
                        onClick={onClose}
                        className="absolute z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        style={{
                            top: 'max(16px, env(safe-area-inset-top))',
                            left: SPACING.lg,
                            width: 44,
                            height: 44,
                            borderRadius: RADIUS.md,
                        }}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Rating Badge */}
                    <div
                        className="absolute z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md"
                        style={{
                            top: 'max(16px, env(safe-area-inset-top))',
                            right: SPACING.lg,
                            padding: `${SPACING.sm}px ${SPACING.md}px`,
                            borderRadius: RADIUS.md,
                            minHeight: 36,
                        }}
                    >
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-white text-sm font-semibold">{restaurant.rating?.toFixed(1) || '–'}</span>
                    </div>

                    {/* Title & Meta on Image */}
                    <div
                        className="absolute bottom-0 left-0 right-0 z-10"
                        style={{ padding: SPACING.xl }}
                    >
                        <h1
                            className="text-white text-2xl font-bold leading-tight"
                            style={{
                                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                                marginBottom: SPACING.sm,
                            }}
                        >
                            {restaurant.name}
                        </h1>

                        {/* Meta Line 1: Cuisine & Price */}
                        <p className="text-white/90 text-base font-medium" style={{ marginBottom: SPACING.xs }}>
                            {getDisplayCategory()}
                            <span className="mx-2 text-white/50">•</span>
                            {formatPrice(restaurant.price_for_two)} for two
                            <span className="mx-2 text-white/50">•</span>
                            {distance}
                        </p>

                        {/* Meta Line 2: Area */}
                        <p className="text-white/70 text-sm">
                            {restaurant.area}
                        </p>
                    </div>
                </div>

                {/* Content Below Image */}
                <div
                    className="bg-zinc-950"
                    style={{ padding: SPACING.xl, paddingBottom: 40 }}
                >
                    {/* CTA Buttons Section */}
                    <div style={{ marginBottom: SPACING.xxl }}>
                        {/* Primary: Directions */}
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-emerald-500 text-white font-semibold text-base active:scale-[0.98] transition-transform"
                            style={{
                                padding: `${SPACING.lg}px ${SPACING.xl}px`,
                                borderRadius: RADIUS.lg,
                                minHeight: 56,
                                marginBottom: SPACING.md,
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Get Directions
                        </a>

                        {/* Zomato Button */}
                        {restaurant.url && (
                            <a
                                href={restaurant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-zinc-800 text-white font-medium text-sm active:scale-[0.98] transition-transform"
                                style={{
                                    padding: `${SPACING.md}px ${SPACING.lg}px`,
                                    borderRadius: RADIUS.lg,
                                    minHeight: 48,
                                }}
                            >
                                <span className="text-red-500 font-bold text-base">z</span>
                                <span>View on Zomato</span>
                            </a>
                        )}
                    </div>

                    {/* Ambiance Section */}
                    {ambianceTags.length > 0 && (
                        <div style={{ marginBottom: SPACING.xxl }}>
                            <h3
                                className="text-zinc-400 text-xs font-semibold uppercase tracking-wider"
                                style={{ marginBottom: SPACING.md }}
                            >
                                Ambiance
                            </h3>
                            <div className="flex flex-wrap" style={{ gap: SPACING.sm }}>
                                {visibleTags.map((tag: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="text-zinc-200 text-sm bg-zinc-800/80"
                                        style={{
                                            padding: `${SPACING.sm}px ${SPACING.md}px`,
                                            borderRadius: RADIUS.md,
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span
                                        className="text-zinc-500 text-sm bg-zinc-800/50"
                                        style={{
                                            padding: `${SPACING.sm}px ${SPACING.md}px`,
                                            borderRadius: RADIUS.md,
                                        }}
                                    >
                                        +{remainingCount} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Photos Section */}
                    {galleryPhotos.length > 0 && (
                        <div style={{ marginBottom: SPACING.xxl }}>
                            <h3
                                className="text-zinc-400 text-xs font-semibold uppercase tracking-wider"
                                style={{ marginBottom: SPACING.md }}
                            >
                                Photos
                            </h3>
                            <div
                                className="grid grid-cols-3"
                                style={{ gap: SPACING.sm }}
                            >
                                {galleryPhotos.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="relative bg-zinc-800 overflow-hidden"
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: RADIUS.md,
                                        }}
                                    >
                                        <Image
                                            src={url}
                                            alt={`${restaurant.name} ${idx + 2}`}
                                            fill
                                            className="object-cover"
                                            sizes="150px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {restaurant.address && (
                        <div>
                            <h3
                                className="text-zinc-400 text-xs font-semibold uppercase tracking-wider"
                                style={{ marginBottom: SPACING.sm }}
                            >
                                Full Address
                            </h3>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                {restaurant.address}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

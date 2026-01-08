'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Restaurant } from '@/types';
import { formatDistance, getDirectionsUrl } from '@/utils/location';

interface RestaurantCardProps {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
    isDefaultLocation: boolean;
    isActive: boolean;
    onScrollStateChange?: (isScrolling: boolean) => void;
}

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
    full: 9999,
};

export const RestaurantCard = memo(function RestaurantCard({
    restaurant,
    userLat,
    userLon,
    isDefaultLocation,
    isActive,
    onScrollStateChange,
}: RestaurantCardProps) {
    const [imageError, setImageError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [isScrolling, setIsScrolling] = useState(false);

    const imageUrl = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);
    const directionsUrl = getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name);

    // Parse ambiance tags - max 3 + count
    const ambianceTags = restaurant.ambiance_tags || [];
    const visibleTags = ambianceTags.slice(0, 3);
    const remainingCount = Math.max(0, ambianceTags.length - 3);

    // Filter REAL photos only (no placeholders, no brand images, no o2_assets)
    const galleryPhotos = (restaurant.image_urls || [])
        .slice(1, 6)
        .filter(url =>
            url &&
            !url.includes('placeholder') &&
            !url.toLowerCase().includes('zomato') &&
            !url.toLowerCase().includes('brand') &&
            !url.toLowerCase().includes('logo') &&
            !url.includes('o2_assets')
        );

    // Format price nicely
    const formatPrice = (price: number) => {
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}k`;
        return `₹${price}`;
    };

    // Get first cuisine only (cuisines may be comma-separated)
    const getFirstCuisine = (cuisineStr: string | undefined) => {
        if (!cuisineStr) return 'Restaurant';
        const first = cuisineStr.split(',')[0].trim();
        return first || 'Restaurant';
    };

    // Scroll detection - notify parent when scrolling
    const handleScroll = useCallback(() => {
        setIsScrolling(true);
        onScrollStateChange?.(true);

        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
            onScrollStateChange?.(false);
        }, 200);
    }, [onScrollStateChange]);

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl || !isActive) return;

        scrollEl.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            scrollEl.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeoutRef.current);
        };
    }, [isActive, handleScroll]);

    return (
        <div className="relative w-full h-full bg-zinc-950 rounded-3xl overflow-hidden">
            {/* Scrollable Content - FIXED: touch-pan-y allows vertical scroll */}
            <div
                ref={scrollRef}
                className="w-full h-full overflow-y-auto overscroll-y-contain touch-pan-y"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                }}
            >
                {/* Hero Image Section - Fixed height, not aspect ratio */}
                <div className="relative w-full" style={{ height: '55vh', minHeight: '320px' }}>
                    {!imageError ? (
                        <Image
                            src={imageUrl}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                            priority={isActive}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-7xl">🍽️</span>
                        </div>
                    )}

                    {/* Gradient Overlay - Stronger, cleaner */}
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

                    {/* Top Badges Row - Consistent sizing */}
                    <div
                        className="absolute top-0 left-0 right-0 flex justify-between items-start z-10"
                        style={{ padding: SPACING.lg }}
                    >
                        {/* Rating Badge */}
                        <div
                            className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md"
                            style={{
                                padding: `${SPACING.sm}px ${SPACING.md}px`,
                                borderRadius: RADIUS.md,
                                minHeight: 36,
                            }}
                        >
                            <span className="text-amber-400 text-sm">★</span>
                            <span className="text-white text-sm font-semibold">{restaurant.rating?.toFixed(1) || '–'}</span>
                        </div>

                        {/* Distance Badge */}
                        <div
                            className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md"
                            style={{
                                padding: `${SPACING.sm}px ${SPACING.md}px`,
                                borderRadius: RADIUS.md,
                                minHeight: 36,
                            }}
                        >
                            <span className="text-emerald-400 text-sm">📍</span>
                            <span className="text-white text-sm font-medium whitespace-nowrap">{distance}</span>
                        </div>
                    </div>

                    {/* Title & Meta on Image - More breathing room */}
                    <div
                        className="absolute bottom-0 left-0 right-0 z-10"
                        style={{ padding: SPACING.xl }}
                    >
                        {/* Restaurant Name */}
                        <h2
                            className="text-white text-2xl font-bold leading-tight"
                            style={{
                                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                                marginBottom: SPACING.sm,
                            }}
                        >
                            {restaurant.name}
                        </h2>

                        {/* Meta Line 1: Cuisine & Price */}
                        <p className="text-white/90 text-base font-medium" style={{ marginBottom: SPACING.xs }}>
                            {getFirstCuisine(restaurant.cuisine)}
                            <span className="mx-2 text-white/50">•</span>
                            {formatPrice(restaurant.price_for_two)} for two
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
                    style={{ padding: SPACING.xl, paddingBottom: 100 }}
                >
                    {/* CTA Buttons Section */}
                    <div style={{ marginBottom: SPACING.xxl }}>
                        {/* Primary: Directions */}
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
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

                        {/* Secondary Row */}
                        <div className="flex gap-3">
                            {/* Zomato */}
                            {restaurant.url && (
                                <a
                                    href={restaurant.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium text-sm active:scale-[0.98] transition-transform"
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
                        <div style={{ marginBottom: SPACING.xl }}>
                            <h3
                                className="text-zinc-400 text-xs font-semibold uppercase tracking-wider"
                                style={{ marginBottom: SPACING.md }}
                            >
                                More Photos
                            </h3>
                            <div
                                className="flex overflow-x-auto pb-2 -mx-5 px-5"
                                style={{
                                    gap: SPACING.md,
                                    scrollbarWidth: 'none',
                                }}
                            >
                                {galleryPhotos.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="relative flex-shrink-0 bg-zinc-800 overflow-hidden"
                                        style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: RADIUS.md,
                                        }}
                                    >
                                        <Image
                                            src={url}
                                            alt={`${restaurant.name} ${idx + 2}`}
                                            fill
                                            className="object-cover"
                                            sizes="100px"
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
        </div>
    );
});

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

// Memoized for performance - prevents re-renders during swipe
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

    const imageUrl = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);
    const directionsUrl = getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name);

    // Parse ambiance tags
    const ambianceTags = restaurant.ambiance_tags || [];
    const visibleTags = ambianceTags.slice(0, 4);
    const remainingCount = Math.max(0, ambianceTags.length - 4);

    // Filter real photos (no placeholders or brand images)
    const galleryPhotos = (restaurant.image_urls || [])
        .slice(1, 8)
        .filter(url => url &&
            !url.includes('placeholder') &&
            !url.toLowerCase().includes('zomato') &&
            !url.toLowerCase().includes('brand'));

    // Scroll detection for gesture isolation
    const handleScroll = useCallback(() => {
        onScrollStateChange?.(true);
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            onScrollStateChange?.(false);
        }, 150);
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
            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                className="w-full h-full overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Hero Image Section */}
                <div className="relative w-full aspect-[3/4]">
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
                            <span className="text-6xl">🍽️</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.85) 100%)'
                        }}
                    />

                    {/* Top Badges: Rating & Distance */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                        {/* Rating Badge */}
                        <div className="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm flex items-center gap-1.5">
                            <span className="text-amber-400 text-sm">⭐</span>
                            <span className="text-white text-sm font-semibold">{restaurant.rating}</span>
                        </div>

                        {/* Distance Badge */}
                        <div className="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm flex items-center gap-1.5">
                            <span className="text-blue-400 text-sm">📍</span>
                            <span className="text-white text-sm font-medium">{distance}</span>
                        </div>
                    </div>

                    {/* Title & Meta on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                        <h2
                            className="text-white text-2xl font-bold leading-tight mb-2"
                            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                        >
                            {restaurant.name}
                        </h2>
                        <p className="text-white/80 text-sm">
                            {restaurant.cuisine || 'Multi-cuisine'}
                            <span className="mx-2 text-white/40">•</span>
                            ₹{restaurant.price_for_two} for two
                            <span className="mx-2 text-white/40">•</span>
                            {restaurant.area}
                        </p>
                    </div>
                </div>

                {/* Content Below Image */}
                <div className="p-5 space-y-5 bg-zinc-950">

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        {/* Primary: Directions */}
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500 text-white font-semibold active:scale-[0.98] transition-transform"
                            style={{ minHeight: '52px' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Get Directions
                        </a>

                        {/* Secondary Row: Zomato + Call */}
                        <div className="flex gap-3">
                            {restaurant.url && (
                                <a
                                    href={restaurant.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-zinc-800 text-white font-medium border border-zinc-700 active:scale-[0.98] transition-transform"
                                    style={{ minHeight: '48px' }}
                                >
                                    <span className="text-base">🍽️</span>
                                    Zomato
                                </a>
                            )}
                            {restaurant.phone && (
                                <a
                                    href={`tel:${restaurant.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-zinc-800 text-white font-medium border border-zinc-700 active:scale-[0.98] transition-transform"
                                    style={{ minHeight: '48px' }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Ambiance Chips */}
                    {ambianceTags.length > 0 && (
                        <div>
                            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Ambiance</h3>
                            <div className="flex flex-wrap gap-2">
                                {visibleTags.map((tag: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-sm border border-zinc-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-500 text-sm border border-zinc-700">
                                        +{remainingCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* More Photos Carousel */}
                    {galleryPhotos.length > 0 && (
                        <div>
                            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">More Photos</h3>
                            <div
                                className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {galleryPhotos.map((url, idx) => (
                                    <div key={idx} className="relative flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden bg-zinc-800">
                                        <Image
                                            src={url}
                                            alt={`${restaurant.name} ${idx + 2}`}
                                            fill
                                            className="object-cover"
                                            sizes="112px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {restaurant.address && (
                        <div>
                            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Address</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{restaurant.address}</p>
                        </div>
                    )}

                    {/* Bottom padding for safe area */}
                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
});

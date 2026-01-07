'use client';

import { useState, useEffect, useRef } from 'react';
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

export function RestaurantCard({
    restaurant,
    userLat,
    userLon,
    isDefaultLocation,
    isActive,
    onScrollStateChange,
}: RestaurantCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const imageUrl = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);
    const directionsUrl = getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name);

    // Detect scrolling to prevent accidental swipes
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || !isActive) return;

        const handleScroll = () => {
            setIsScrolling(true);
            onScrollStateChange?.(true);

            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
                onScrollStateChange?.(false);
            }, 150);
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeoutRef.current);
        };
    }, [isActive, onScrollStateChange]);

    // Parse popular dishes (always a string in our types)
    const dishes = restaurant.popular_dishes
        ? restaurant.popular_dishes.split(',').map((d: string) => d.trim()).filter(Boolean)
        : [];

    // Ambiance tags is always an array
    const ambianceTags = restaurant.ambiance_tags || [];

    return (
        <div className="relative w-full h-full bg-zinc-900">
            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="w-full h-full overflow-y-auto overscroll-contain hide-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* EXPANDED Hero Image - Now 70% of card height */}
                <div className="relative w-full h-[70vh]">
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

                    {/* Top badges - Rating & Distance */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                            <span className="text-emerald-400 text-sm">⭐</span>
                            <span className="text-white text-sm font-semibold">{restaurant.rating}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                            <span className="text-white text-sm font-medium">{distance}</span>
                        </div>
                    </div>

                    {/* GRADIENT SCRIM for Text Readability (60% transparent → 100% dark) */}
                    <div
                        className="absolute inset-0 z-[1]"
                        style={{
                            background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.9) 100%)'
                        }}
                    />

                    {/* Restaurant Name OVERLAID on Image - Bottom Left */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h2
                            className="text-white text-3xl font-bold leading-tight mb-0"
                            style={{
                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                                fontWeight: 700
                            }}
                        >
                            {restaurant.name}
                        </h2>
                    </div>
                </div>

                {/* Compact Info Pills Below Image */}
                <div className="px-4 py-3 flex items-center gap-2 flex-wrap bg-zinc-900">
                    <div className="px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700">
                        <span className="text-zinc-200 text-sm font-medium">{restaurant.cuisine || 'Various'}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-emerald-400 text-sm font-semibold">₹{restaurant.price_for_two}</span>
                        <span className="text-emerald-400/70 text-xs ml-1">for two</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700">
                        <span className="text-zinc-300 text-sm">📍 {restaurant.area}</span>
                    </div>
                </div>

                {/* Popular Dishes */}
                {dishes.length > 0 && (
                    <div className="px-4 py-4 border-t border-zinc-800/50">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            Popular Dishes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {dishes.slice(0, 6).map((dish: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-300 text-sm border border-orange-500/20"
                                >
                                    {dish}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ambiance Tags */}
                {ambianceTags.length > 0 && (
                    <div className="px-4 py-4 border-t border-zinc-800/50">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            Ambiance
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {ambianceTags.map((tag: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 text-sm border border-purple-500/20"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions - MOVED BELOW THE FOLD (Only visible when scrolling) */}
                <div className="px-4 py-4 border-t border-zinc-800/50">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {restaurant.phone && (
                            <a
                                href={`tel:${restaurant.phone}`}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 active:scale-95 transition-all hover:border-emerald-500/30"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-2xl">📞</span>
                                <span className="text-xs text-zinc-300 font-medium">Call</span>
                            </a>
                        )}
                        {restaurant.latitude && restaurant.longitude && (
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 active:scale-95 transition-all hover:border-emerald-500/30"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-2xl">🗺️</span>
                                <span className="text-xs text-zinc-300 font-medium">Directions</span>
                            </a>
                        )}
                        {restaurant.url && (
                            <a
                                href={restaurant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 active:scale-95 transition-all hover:border-emerald-500/30"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-2xl">🍴</span>
                                <span className="text-xs text-zinc-300 font-medium">Zomato</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Full Address */}
                {restaurant.address && (
                    <div className="px-4 py-4 border-t border-zinc-800/50">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                            Address
                        </h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">{restaurant.address}</p>
                    </div>
                )}

                {/* Image Gallery */}
                {restaurant.image_urls && restaurant.image_urls.length > 1 && (
                    <div className="px-4 py-4 border-t border-zinc-800/50">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            More Photos
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {restaurant.image_urls.slice(1, 7).map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800">
                                    <Image
                                        src={url}
                                        alt={`${restaurant.name} photo ${idx + 2}`}
                                        fill
                                        className="object-cover"
                                        sizes="33vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Padding for Actions Bar */}
                <div className="h-6" />
            </div>
        </div>
    );
}

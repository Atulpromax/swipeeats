'use client';

import Image from 'next/image';
import { Restaurant } from '@/types';
import { formatDistance } from '@/utils/location';

// Design tokens
const SPACING = {
    sm: 8,
    md: 12,
    lg: 16,
};

const RADIUS = {
    md: 12,
    lg: 16,
};

interface MatchRowProps {
    restaurant: Restaurant;
    onSelect: (restaurant: Restaurant) => void;
}

export function MatchRow({ restaurant, onSelect }: MatchRowProps) {
    const imageUrl = restaurant.image_urls?.[0] || '/placeholder-restaurant.jpg';
    const distance = formatDistance(restaurant.distance || 0);

    return (
        <button
            onClick={() => onSelect(restaurant)}
            className="w-full flex items-center bg-zinc-900/60 active:bg-zinc-800 transition-colors text-left"
            style={{
                padding: SPACING.lg,
                borderRadius: RADIUS.lg,
                gap: SPACING.lg,
                minHeight: 80,
            }}
        >
            {/* Thumbnail */}
            <div
                className="relative flex-shrink-0 bg-zinc-800 overflow-hidden"
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: RADIUS.md,
                }}
            >
                <Image
                    src={imageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Name */}
                <h3
                    className="text-white font-medium truncate"
                    style={{ fontSize: 16, marginBottom: SPACING.sm / 2 }}
                >
                    {restaurant.name}
                </h3>

                {/* Metadata */}
                <p className="text-sm truncate" style={{ color: 'rgba(161, 161, 170, 1)' }}>
                    <span className="text-amber-400">★</span>{' '}
                    <span className="text-zinc-300">{restaurant.rating?.toFixed(1)}</span>
                    <span className="mx-2 text-zinc-600">•</span>
                    {restaurant.cuisine || 'Various'}
                    <span className="mx-2 text-zinc-600">•</span>
                    {distance}
                </p>
            </div>

            {/* Chevron */}
            <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
}

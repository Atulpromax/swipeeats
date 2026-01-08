'use client';

import Image from 'next/image';
import { Restaurant } from '@/types';
import { formatDistance } from '@/utils/location';

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
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 active:bg-zinc-800/50 transition-colors text-left"
            style={{ minHeight: '72px' }}
        >
            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
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
                {/* Name - 1 line with ellipsis */}
                <h3 className="text-white font-medium text-base truncate leading-tight">
                    {restaurant.name}
                </h3>

                {/* Metadata - 1 line with ellipsis */}
                <p className="text-zinc-400 text-sm truncate mt-0.5">
                    <span className="text-amber-400">★</span>{' '}
                    <span className="text-zinc-300">{restaurant.rating}</span>
                    <span className="mx-1.5 text-zinc-600">•</span>
                    {restaurant.cuisine || 'Various'}
                    <span className="mx-1.5 text-zinc-600">•</span>
                    {distance}
                </p>
            </div>

            {/* Trailing Action */}
            <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
}

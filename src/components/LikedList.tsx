'use client';

import { Restaurant } from '@/types';
import { formatDistance } from '@/utils/location';

interface LikedListProps {
    restaurants: Restaurant[];
    onSelect: (restaurant: Restaurant) => void;
}

export function LikedList({ restaurants, onSelect }: LikedListProps) {
    if (restaurants.length === 0) {
        return (
            <div className="py-8 text-center text-zinc-500">
                No restaurants liked yet
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-64 overflow-y-auto">
            {restaurants.map((restaurant, i) => (
                <button
                    key={restaurant.id}
                    onClick={() => onSelect(restaurant)}
                    className="w-full flex items-center gap-4 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors text-left"
                >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                            src={restaurant.image_urls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200';
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                            {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                            {restaurant.rating > 0 && (
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {restaurant.rating.toFixed(1)}
                                </span>
                            )}
                            <span>•</span>
                            <span>{formatDistance(restaurant.distance || 999)}</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

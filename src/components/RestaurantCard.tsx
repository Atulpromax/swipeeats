'use client';

import { Restaurant } from '@/types';
import { formatDistance, getDirectionsUrl } from '@/utils/location';

interface RestaurantCardProps {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
    isDefaultLocation: boolean;
    isActive: boolean;
}

export function RestaurantCard({
    restaurant,
    userLat,
    userLon,
    isDefaultLocation,
    isActive,
}: RestaurantCardProps) {
    const heroImage = restaurant.image_urls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    const galleryImages = restaurant.image_urls
        .filter(url => url && !url.includes('o2_assets'))
        .slice(0, 5);

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (restaurant.phone) window.location.href = `tel:${restaurant.phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name);
        window.open(url, '_blank');
    };

    const handleZomato = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (restaurant.url) window.open(restaurant.url, '_blank');
    };

    const formatPrice = (price: number) => {
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}k`;
        return `₹${price}`;
    };

    const ambianceTags = restaurant.ambiance_tags?.slice(0, 4) || [];
    const dishes = restaurant.popular_dishes?.split(',').map(d => d.trim()).filter(Boolean).slice(0, 4) || [];

    return (
        <div
            className="absolute inset-0 bg-zinc-950 overflow-y-auto overscroll-y-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* Hero Image Section */}
            <div className="relative w-full" style={{ aspectRatio: '4/5', minHeight: '400px' }}>
                <img
                    src={heroImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                    }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/30" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {/* Rating */}
                    {restaurant.rating > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-sm">
                            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white font-bold text-sm">{restaurant.rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Distance */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-sm">
                        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white font-medium text-sm">
                            {formatDistance(restaurant.distance || 999)}
                            {isDefaultLocation && <span className="text-zinc-400 ml-0.5">~</span>}
                        </span>
                    </div>
                </div>

                {/* Restaurant info at bottom of hero */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white leading-tight mb-3">
                        {restaurant.name}
                    </h2>
                    <p className="text-lg text-white/90 mb-2">
                        {formatPrice(restaurant.price_for_two)} for two
                    </p>
                    {restaurant.area && (
                        <p className="text-zinc-400">{restaurant.area}</p>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8 space-y-8" style={{ paddingBottom: '160px' }}>

                {/* Quick Actions */}
                <section>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={handleCall}
                            disabled={!restaurant.phone}
                            className="flex flex-col items-center justify-center gap-3 py-5 rounded-2xl bg-zinc-900 disabled:opacity-30 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <span className="text-sm text-zinc-300">Call</span>
                        </button>

                        <button
                            onClick={handleDirections}
                            className="flex flex-col items-center justify-center gap-3 py-5 rounded-2xl bg-zinc-900 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-zinc-300">Directions</span>
                        </button>

                        <button
                            onClick={handleZomato}
                            disabled={!restaurant.url}
                            className="flex flex-col items-center justify-center gap-3 py-5 rounded-2xl bg-zinc-900 disabled:opacity-30 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <span className="text-sm text-zinc-300">Zomato</span>
                        </button>
                    </div>
                </section>

                {/* Ambiance */}
                {ambianceTags.length > 0 && (
                    <section>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Ambiance</h3>
                        <div className="flex flex-wrap gap-3">
                            {ambianceTags.map((tag, i) => (
                                <span key={i} className="px-4 py-2 rounded-full bg-zinc-800 text-zinc-200 text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Popular Dishes */}
                {dishes.length > 0 && (
                    <section>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Popular Dishes</h3>
                        <div className="flex flex-wrap gap-3">
                            {dishes.map((dish, i) => (
                                <span key={i} className="px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-300 text-sm border border-emerald-500/30">
                                    {dish}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Photos */}
                {galleryImages.length > 1 && (
                    <section>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Photos</h3>
                        <div
                            className="flex gap-4 overflow-x-auto -mx-6 px-6 pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            {galleryImages.map((url, i) => (
                                <div key={i} className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-zinc-800">
                                    <img
                                        src={url}
                                        alt={`${restaurant.name} ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

'use client';

import { Restaurant } from '@/types';
import { formatDistance, getDirectionsUrl } from '@/utils/location';
import { motion } from 'framer-motion';

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
    const heroImage = restaurant.image_urls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    const allImages = restaurant.image_urls.filter(url => !url.includes('o2_assets'));

    const handleCall = () => {
        if (restaurant.phone) {
            window.location.href = `tel:${restaurant.phone}`;
        }
    };

    const handleDirections = () => {
        const url = getDirectionsUrl(
            userLat,
            userLon,
            restaurant.latitude,
            restaurant.longitude,
            restaurant.name
        );
        window.open(url, '_blank');
    };

    const handleZomato = () => {
        if (restaurant.url) {
            window.open(restaurant.url, '_blank');
        }
    };

    const formatPrice = (price: number) => {
        if (price >= 1000) {
            return `₹${(price / 1000).toFixed(1)}k for two`;
        }
        return `₹${price} for two`;
    };

    const cuisineTags = restaurant.cuisine
        ? restaurant.cuisine.split(',').map(c => c.trim()).filter(c => c)
        : [];

    const dishes = restaurant.popular_dishes
        ? restaurant.popular_dishes.split(',').map(d => d.trim()).filter(d => d)
        : [];

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
            {/* Header with back button */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between safe-area-top bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 backdrop-blur rounded-full"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center gap-2">
                    {/* Share button placeholder */}
                    <button className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 backdrop-blur rounded-full">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-full h-[50vh] min-h-[300px]">
                <img
                    src={heroImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Rating badge */}
                {restaurant.rating > 0 && (
                    <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur px-3 py-1.5 rounded-xl">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-bold text-lg">{restaurant.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative -mt-8 bg-black rounded-t-3xl">
                <div className="p-6">
                    {/* Name */}
                    <h1 className="text-3xl font-bold text-white mb-3">
                        {restaurant.name}
                    </h1>

                    {/* Cuisine tags */}
                    {cuisineTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {cuisineTags.map((cuisine, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-zinc-800 rounded-full text-sm text-zinc-300"
                                >
                                    {cuisine}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-zinc-400 mb-6">
                        <span className="text-white font-medium">{formatPrice(restaurant.price_for_two)}</span>
                        <span className="text-zinc-600">•</span>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>
                                {formatDistance(restaurant.distance || 999)}
                                {isDefaultLocation && ' ~'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <button
                            onClick={handleCall}
                            disabled={!restaurant.phone}
                            className="flex flex-col items-center gap-2 p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-colors disabled:opacity-40 border border-zinc-800"
                        >
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <span className="text-sm text-zinc-300">Call</span>
                        </button>

                        <button
                            onClick={handleDirections}
                            className="flex flex-col items-center gap-2 p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-colors border border-zinc-800"
                        >
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-zinc-300">Directions</span>
                        </button>

                        <button
                            onClick={handleZomato}
                            disabled={!restaurant.url}
                            className="flex flex-col items-center gap-2 p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-colors disabled:opacity-40 border border-zinc-800"
                        >
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <span className="text-sm text-zinc-300">Zomato</span>
                        </button>
                    </div>

                    {/* Popular Dishes */}
                    {dishes.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Popular Dishes</h2>
                            <div className="flex flex-wrap gap-2">
                                {dishes.map((dish, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl text-orange-200"
                                    >
                                        {dish}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ambiance */}
                    {restaurant.ambiance_tags.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Ambiance</h2>
                            <div className="flex flex-wrap gap-2">
                                {restaurant.ambiance_tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {(restaurant.address || restaurant.area) && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
                            <p className="text-zinc-400">{restaurant.address || restaurant.area}</p>
                            {isDefaultLocation && (
                                <p className="text-zinc-500 text-sm mt-2">
                                    Distance estimated from city center
                                </p>
                            )}
                        </div>
                    )}

                    {/* Photo Gallery */}
                    {allImages.length > 1 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {allImages.slice(0, 6).map((url, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-xl overflow-hidden"
                                    >
                                        <img
                                            src={url}
                                            alt={`${restaurant.name} photo ${i + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Safe area padding */}
                <div className="h-20 safe-area-bottom" />
            </div>
        </motion.div>
    );
}

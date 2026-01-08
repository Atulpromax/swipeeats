'use client';

import { Restaurant } from '@/types';
import { getDirectionsUrl } from '@/utils/location';

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
    md: 12,
    lg: 16,
};

interface ActionButtonsProps {
    restaurant: Restaurant;
    userLat: number;
    userLon: number;
}

export function ActionButtons({ restaurant, userLat, userLon }: ActionButtonsProps) {
    const directionsUrl = getDirectionsUrl(userLat, userLon, restaurant.latitude, restaurant.longitude, restaurant.name);

    return (
        <div style={{ marginTop: SPACING.xxl }}>
            {/* Primary CTA - Directions */}
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

            {/* Secondary Actions Row */}
            <div className="flex" style={{ gap: SPACING.md }}>
                {/* Open in Zomato */}
                {restaurant.url && (
                    <a
                        href={restaurant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium text-sm active:scale-[0.98] transition-transform"
                        style={{
                            padding: `${SPACING.md}px ${SPACING.lg}px`,
                            borderRadius: RADIUS.lg,
                            minHeight: 52,
                        }}
                    >
                        <span className="text-red-500 font-bold text-base">z</span>
                        <span>View on Zomato</span>
                    </a>
                )}

                {/* Call */}
                {restaurant.phone && (
                    <a
                        href={`tel:${restaurant.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium text-sm active:scale-[0.98] transition-transform"
                        style={{
                            padding: `${SPACING.md}px ${SPACING.lg}px`,
                            borderRadius: RADIUS.lg,
                            minHeight: 52,
                        }}
                    >
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Call</span>
                    </a>
                )}
            </div>
        </div>
    );
}

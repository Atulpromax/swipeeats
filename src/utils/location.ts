import { UserLocation } from '@/types';

// Gurgaon city center (default fallback)
export const DEFAULT_LOCATION: UserLocation = {
    latitude: 28.4595,
    longitude: 77.0266,
    isDefault: true,
};

// Haversine formula to calculate distance between two points in km
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999; // Return large number if coords missing

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(km: number): string {
    if (km >= 999) return '—';
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)} km`;
}

// Request user's geolocation
export function getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(DEFAULT_LOCATION);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    isDefault: false,
                });
            },
            () => {
                // Permission denied or error - use default
                resolve(DEFAULT_LOCATION);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 300000, // 5 minutes cache
            }
        );
    });
}

// Detect iOS for Apple Maps preference
export function isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Get directions URL (Apple Maps on iOS, Google Maps elsewhere)
export function getDirectionsUrl(
    userLat: number,
    userLon: number,
    destLat: number,
    destLon: number,
    destName: string
): string {
    const encodedName = encodeURIComponent(destName);

    if (isIOS()) {
        return `maps://maps.apple.com/?saddr=${userLat},${userLon}&daddr=${destLat},${destLon}&q=${encodedName}`;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${destLat},${destLon}`;
}

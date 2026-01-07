import Papa from 'papaparse';
import { Restaurant } from '@/types';

interface CSVRow {
    name: string;
    cuisine: string;
    rating: string;
    price_for_two: string;
    address: string;
    area: string;
    latitude: string;
    longitude: string;
    image_urls: string;
    phone: string;
    popular_dishes: string;
    ambiance_tags: string;
    url: string;
}

// Parse price like "₹100" or "₹1,400" to number
function parsePrice(priceStr: string): number {
    if (!priceStr) return 500; // Default moderate price
    const cleaned = priceStr.replace(/[₹,\s]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 500 : parsed;
}

// Parse image URLs from comma-separated string
function parseImageUrls(urlStr: string): string[] {
    if (!urlStr) return [];
    return urlStr
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0 && url.startsWith('http'));
}

// Parse ambiance tags from comma-separated string
function parseAmbianceTags(tagsStr: string): string[] {
    if (!tagsStr) return [];
    return tagsStr
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

// Filter out collection pages and invalid entries
function isValidRestaurant(row: CSVRow): boolean {
    // Skip collection pages (contain "Restaurants," in the name)
    if (row.name?.includes('Restaurants,') || row.name?.includes('Restaurants ')) {
        return false;
    }
    // Skip entries without names
    if (!row.name || row.name.trim().length === 0) {
        return false;
    }
    // Skip "Best Food" type entries
    if (row.name?.includes('Best Food')) {
        return false;
    }
    return true;
}

// Generate unique ID from restaurant data
function generateId(row: CSVRow, index: number): string {
    const nameSlug = (row.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 30);
    return `${nameSlug}-${index}`;
}

export async function parseRestaurantCSV(csvPath: string): Promise<Restaurant[]> {
    try {
        const response = await fetch(csvPath);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse<CSVRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const restaurants: Restaurant[] = results.data
                        .filter(isValidRestaurant)
                        .map((row, index) => ({
                            id: generateId(row, index),
                            name: row.name?.trim() || 'Unknown Restaurant',
                            cuisine: row.cuisine?.trim() || '',
                            rating: parseFloat(row.rating) || 0,
                            price_for_two: parsePrice(row.price_for_two),
                            address: row.address?.trim() || '',
                            area: row.area?.trim() || '',
                            latitude: parseFloat(row.latitude) || 0,
                            longitude: parseFloat(row.longitude) || 0,
                            image_urls: parseImageUrls(row.image_urls),
                            phone: row.phone?.trim() || '',
                            popular_dishes: row.popular_dishes?.trim() || '',
                            ambiance_tags: parseAmbianceTags(row.ambiance_tags),
                            url: row.url?.trim() || '',
                        }));

                    // Remove duplicates by name (keep first occurrence)
                    const seen = new Set<string>();
                    const uniqueRestaurants = restaurants.filter(r => {
                        const key = r.name.toLowerCase();
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });

                    resolve(uniqueRestaurants);
                },
                error: (error: Error) => {
                    reject(error);
                },
            });
        });
    } catch (error) {
        console.error('Failed to parse CSV:', error);
        return [];
    }
}

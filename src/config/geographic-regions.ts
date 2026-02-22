/**
 * Geographic regions configuration for global filtering.
 * Supports filtering by countries, states, cities, and custom regions.
 */

export interface GeographicRegion {
  id: string;
  label: string;
  type: 'global' | 'continent' | 'country' | 'state' | 'city' | 'custom';
  // Map viewport for auto-zoom
  viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  // Optional bounding box for data filtering
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  // Optional country codes for feed/data filtering (ISO 3166-1 alpha-2)
  countryCodes?: string[];
  // Optional city names for webcam/news filtering
  cities?: string[];
  // Parent region (for hierarchical filtering)
  parent?: string;
}

export const GEOGRAPHIC_REGIONS: GeographicRegion[] = [
  // Global view
  {
    id: 'global',
    label: 'Global',
    type: 'global',
    viewport: { latitude: 20, longitude: 0, zoom: 1.5 },
  },

  // Continents
  {
    id: 'north-america',
    label: 'North America',
    type: 'continent',
    viewport: { latitude: 45, longitude: -100, zoom: 3 },
    bounds: { north: 72, south: 15, east: -50, west: -170 },
    countryCodes: ['US', 'CA', 'MX'],
  },
  {
    id: 'europe',
    label: 'Europe',
    type: 'continent',
    viewport: { latitude: 50, longitude: 10, zoom: 4 },
    bounds: { north: 71, south: 35, east: 40, west: -10 },
  },
  {
    id: 'middle-east',
    label: 'Middle East',
    type: 'continent',
    viewport: { latitude: 29, longitude: 45, zoom: 4.5 },
    bounds: { north: 42, south: 12, east: 63, west: 25 },
    countryCodes: ['IL', 'JO', 'SY', 'LB', 'IQ', 'IR', 'SA', 'AE', 'YE', 'OM', 'KW', 'QA', 'BH'],
  },
  {
    id: 'asia',
    label: 'Asia',
    type: 'continent',
    viewport: { latitude: 30, longitude: 100, zoom: 3 },
    bounds: { north: 55, south: -10, east: 150, west: 60 },
  },
  {
    id: 'latin-america',
    label: 'Latin America',
    type: 'continent',
    viewport: { latitude: -10, longitude: -60, zoom: 3 },
    bounds: { north: 15, south: -55, east: -30, west: -120 },
  },
  {
    id: 'africa',
    label: 'Africa',
    type: 'continent',
    viewport: { latitude: 0, longitude: 20, zoom: 3 },
    bounds: { north: 37, south: -35, east: 52, west: -18 },
  },

  // United States
  {
    id: 'usa',
    label: 'United States',
    type: 'country',
    viewport: { latitude: 39, longitude: -98, zoom: 4 },
    bounds: { north: 49, south: 25, east: -66, west: -125 },
    countryCodes: ['US'],
    parent: 'north-america',
  },

  // US States
  {
    id: 'california',
    label: 'California',
    type: 'state',
    viewport: { latitude: 37, longitude: -119, zoom: 6 },
    bounds: { north: 42, south: 32.5, east: -114, west: -124.5 },
    countryCodes: ['US'],
    parent: 'usa',
  },
  {
    id: 'texas',
    label: 'Texas',
    type: 'state',
    viewport: { latitude: 31, longitude: -99, zoom: 6 },
    bounds: { north: 36.5, south: 25.8, east: -93.5, west: -106.6 },
    countryCodes: ['US'],
    parent: 'usa',
  },
  {
    id: 'tennessee',
    label: 'Tennessee',
    type: 'state',
    viewport: { latitude: 35.86, longitude: -86.66, zoom: 7 },
    bounds: { north: 36.68, south: 34.98, east: -81.65, west: -90.31 },
    countryCodes: ['US'],
    cities: ['knoxville', 'nashville', 'memphis', 'chattanooga'],
    parent: 'usa',
  },
  {
    id: 'new-york',
    label: 'New York',
    type: 'state',
    viewport: { latitude: 43, longitude: -75, zoom: 6.5 },
    bounds: { north: 45, south: 40.5, east: -71.8, west: -79.8 },
    countryCodes: ['US'],
    parent: 'usa',
  },
  {
    id: 'florida',
    label: 'Florida',
    type: 'state',
    viewport: { latitude: 28, longitude: -82, zoom: 6.5 },
    bounds: { north: 31, south: 24.5, east: -80, west: -87.6 },
    countryCodes: ['US'],
    parent: 'usa',
  },

  // US Cities
  {
    id: 'knoxville',
    label: 'Knoxville, TN',
    type: 'city',
    viewport: { latitude: 35.9606, longitude: -83.9207, zoom: 11 },
    bounds: { north: 36.1, south: 35.85, east: -83.7, west: -84.2 },
    countryCodes: ['US'],
    cities: ['knoxville'],
    parent: 'tennessee',
  },
  {
    id: 'san-francisco',
    label: 'San Francisco, CA',
    type: 'city',
    viewport: { latitude: 37.7749, longitude: -122.4194, zoom: 11 },
    bounds: { north: 37.83, south: 37.7, east: -122.35, west: -122.52 },
    countryCodes: ['US'],
    cities: ['san francisco'],
    parent: 'california',
  },
  {
    id: 'los-angeles',
    label: 'Los Angeles, CA',
    type: 'city',
    viewport: { latitude: 34.0522, longitude: -118.2437, zoom: 10 },
    bounds: { north: 34.34, south: 33.7, east: -118.15, west: -118.67 },
    countryCodes: ['US'],
    cities: ['los angeles'],
    parent: 'california',
  },
  {
    id: 'new-york-city',
    label: 'New York City, NY',
    type: 'city',
    viewport: { latitude: 40.7128, longitude: -74.006, zoom: 11 },
    bounds: { north: 40.92, south: 40.5, east: -73.7, west: -74.26 },
    countryCodes: ['US'],
    cities: ['new york', 'nyc', 'manhattan', 'brooklyn'],
    parent: 'new-york',
  },
  {
    id: 'washington-dc',
    label: 'Washington, DC',
    type: 'city',
    viewport: { latitude: 38.9072, longitude: -77.0369, zoom: 11 },
    bounds: { north: 39, south: 38.8, east: -76.9, west: -77.12 },
    countryCodes: ['US'],
    cities: ['washington', 'washington dc'],
    parent: 'usa',
  },
  {
    id: 'miami',
    label: 'Miami, FL',
    type: 'city',
    viewport: { latitude: 25.7617, longitude: -80.1918, zoom: 11 },
    bounds: { north: 25.86, south: 25.7, east: -80.12, west: -80.32 },
    countryCodes: ['US'],
    cities: ['miami'],
    parent: 'florida',
  },

  // Mexico
  {
    id: 'mexico',
    label: 'Mexico',
    type: 'country',
    viewport: { latitude: 23.6345, longitude: -102.5528, zoom: 5 },
    bounds: { north: 32.7, south: 14.5, east: -86.7, west: -118.4 },
    countryCodes: ['MX'],
    parent: 'north-america',
  },
  {
    id: 'puerto-vallarta',
    label: 'Puerto Vallarta, Mexico',
    type: 'city',
    viewport: { latitude: 20.6534, longitude: -105.2253, zoom: 12 },
    bounds: { north: 20.75, south: 20.55, east: -105.15, west: -105.35 },
    countryCodes: ['MX'],
    cities: ['puerto vallarta', 'puerto-vallarta'],
    parent: 'mexico',
  },
  {
    id: 'mexico-city',
    label: 'Mexico City, Mexico',
    type: 'city',
    viewport: { latitude: 19.4326, longitude: -99.1332, zoom: 11 },
    bounds: { north: 19.6, south: 19.2, east: -98.95, west: -99.37 },
    countryCodes: ['MX'],
    cities: ['mexico city'],
    parent: 'mexico',
  },

  // Canada
  {
    id: 'canada',
    label: 'Canada',
    type: 'country',
    viewport: { latitude: 56.1304, longitude: -106.3468, zoom: 3.5 },
    bounds: { north: 83.1, south: 41.7, east: -52.6, west: -141 },
    countryCodes: ['CA'],
    parent: 'north-america',
  },

  // Middle East - Key cities
  {
    id: 'israel',
    label: 'Israel',
    type: 'country',
    viewport: { latitude: 31.5, longitude: 34.9, zoom: 7.5 },
    bounds: { north: 33.3, south: 29.5, east: 35.9, west: 34.2 },
    countryCodes: ['IL'],
    parent: 'middle-east',
  },
  {
    id: 'jerusalem',
    label: 'Jerusalem, Israel',
    type: 'city',
    viewport: { latitude: 31.7683, longitude: 35.2137, zoom: 12 },
    bounds: { north: 31.87, south: 31.72, east: 35.28, west: 35.15 },
    countryCodes: ['IL'],
    cities: ['jerusalem'],
    parent: 'israel',
  },
  {
    id: 'tel-aviv',
    label: 'Tel Aviv, Israel',
    type: 'city',
    viewport: { latitude: 32.0853, longitude: 34.7818, zoom: 12 },
    bounds: { north: 32.15, south: 32.02, east: 34.86, west: 34.74 },
    countryCodes: ['IL'],
    cities: ['tel aviv'],
    parent: 'israel',
  },
  {
    id: 'iran',
    label: 'Iran',
    type: 'country',
    viewport: { latitude: 32.4279, longitude: 53.688, zoom: 5.5 },
    bounds: { north: 39.8, south: 25, east: 63.3, west: 44 },
    countryCodes: ['IR'],
    parent: 'middle-east',
  },
  {
    id: 'tehran',
    label: 'Tehran, Iran',
    type: 'city',
    viewport: { latitude: 35.6892, longitude: 51.389, zoom: 11 },
    bounds: { north: 35.85, south: 35.56, east: 51.6, west: 51.15 },
    countryCodes: ['IR'],
    cities: ['tehran'],
    parent: 'iran',
  },
  {
    id: 'saudi-arabia',
    label: 'Saudi Arabia',
    type: 'country',
    viewport: { latitude: 24, longitude: 45, zoom: 5.5 },
    bounds: { north: 32, south: 16, east: 56, west: 34.5 },
    countryCodes: ['SA'],
    parent: 'middle-east',
  },
  {
    id: 'uae',
    label: 'United Arab Emirates',
    type: 'country',
    viewport: { latitude: 24, longitude: 54, zoom: 7 },
    bounds: { north: 26.1, south: 22.6, east: 56.4, west: 51.5 },
    countryCodes: ['AE'],
    parent: 'middle-east',
  },

  // Europe - Key countries
  {
    id: 'ukraine',
    label: 'Ukraine',
    type: 'country',
    viewport: { latitude: 49, longitude: 32, zoom: 6 },
    bounds: { north: 52.4, south: 44.4, east: 40.2, west: 22.1 },
    countryCodes: ['UA'],
    parent: 'europe',
  },
  {
    id: 'kyiv',
    label: 'Kyiv, Ukraine',
    type: 'city',
    viewport: { latitude: 50.4501, longitude: 30.5234, zoom: 11 },
    bounds: { north: 50.59, south: 50.21, east: 30.83, west: 30.24 },
    countryCodes: ['UA'],
    cities: ['kyiv', 'kiev'],
    parent: 'ukraine',
  },
  {
    id: 'russia',
    label: 'Russia',
    type: 'country',
    viewport: { latitude: 61.5, longitude: 105, zoom: 3 },
    bounds: { north: 81.9, south: 41.2, east: -169, west: 19.6 },
    countryCodes: ['RU'],
    parent: 'europe',
  },
  {
    id: 'france',
    label: 'France',
    type: 'country',
    viewport: { latitude: 46.6, longitude: 2.3, zoom: 6 },
    bounds: { north: 51.1, south: 41.3, east: 9.6, west: -5.1 },
    countryCodes: ['FR'],
    parent: 'europe',
  },
  {
    id: 'paris',
    label: 'Paris, France',
    type: 'city',
    viewport: { latitude: 48.8566, longitude: 2.3522, zoom: 11 },
    bounds: { north: 48.9, south: 48.82, east: 2.42, west: 2.22 },
    countryCodes: ['FR'],
    cities: ['paris'],
    parent: 'france',
  },
  {
    id: 'uk',
    label: 'United Kingdom',
    type: 'country',
    viewport: { latitude: 54, longitude: -2, zoom: 6 },
    bounds: { north: 60.8, south: 49.9, east: 1.8, west: -8 },
    countryCodes: ['GB'],
    parent: 'europe',
  },
  {
    id: 'london',
    label: 'London, UK',
    type: 'city',
    viewport: { latitude: 51.5074, longitude: -0.1278, zoom: 11 },
    bounds: { north: 51.69, south: 51.38, east: 0.15, west: -0.51 },
    countryCodes: ['GB'],
    cities: ['london'],
    parent: 'uk',
  },

  // Asia - Key countries and cities
  {
    id: 'china',
    label: 'China',
    type: 'country',
    viewport: { latitude: 35, longitude: 105, zoom: 4 },
    bounds: { north: 53.6, south: 18, east: 134.8, west: 73.5 },
    countryCodes: ['CN'],
    parent: 'asia',
  },
  {
    id: 'shanghai',
    label: 'Shanghai, China',
    type: 'city',
    viewport: { latitude: 31.2304, longitude: 121.4737, zoom: 11 },
    bounds: { north: 31.53, south: 30.68, east: 121.93, west: 120.85 },
    countryCodes: ['CN'],
    cities: ['shanghai'],
    parent: 'china',
  },
  {
    id: 'taiwan',
    label: 'Taiwan',
    type: 'country',
    viewport: { latitude: 24, longitude: 121, zoom: 7.5 },
    bounds: { north: 25.3, south: 21.9, east: 122.1, west: 120 },
    countryCodes: ['TW'],
    parent: 'asia',
  },
  {
    id: 'taipei',
    label: 'Taipei, Taiwan',
    type: 'city',
    viewport: { latitude: 25.033, longitude: 121.5654, zoom: 11 },
    bounds: { north: 25.21, south: 24.96, east: 121.67, west: 121.46 },
    countryCodes: ['TW'],
    cities: ['taipei'],
    parent: 'taiwan',
  },
  {
    id: 'japan',
    label: 'Japan',
    type: 'country',
    viewport: { latitude: 36.2, longitude: 138.25, zoom: 5.5 },
    bounds: { north: 45.5, south: 24, east: 154, west: 123 },
    countryCodes: ['JP'],
    parent: 'asia',
  },
  {
    id: 'tokyo',
    label: 'Tokyo, Japan',
    type: 'city',
    viewport: { latitude: 35.6762, longitude: 139.6503, zoom: 11 },
    bounds: { north: 35.9, south: 35.5, east: 139.92, west: 139.34 },
    countryCodes: ['JP'],
    cities: ['tokyo'],
    parent: 'japan',
  },
  {
    id: 'south-korea',
    label: 'South Korea',
    type: 'country',
    viewport: { latitude: 37, longitude: 127.5, zoom: 7 },
    bounds: { north: 38.6, south: 33.1, east: 130.9, west: 124.6 },
    countryCodes: ['KR'],
    parent: 'asia',
  },
  {
    id: 'seoul',
    label: 'Seoul, South Korea',
    type: 'city',
    viewport: { latitude: 37.5665, longitude: 126.978, zoom: 11 },
    bounds: { north: 37.7, south: 37.43, east: 127.18, west: 126.76 },
    countryCodes: ['KR'],
    cities: ['seoul'],
    parent: 'south-korea',
  },
  {
    id: 'australia',
    label: 'Australia',
    type: 'country',
    viewport: { latitude: -25, longitude: 133, zoom: 4 },
    bounds: { north: -10, south: -44, east: 154, west: 113 },
    countryCodes: ['AU'],
    parent: 'asia',
  },
  {
    id: 'sydney',
    label: 'Sydney, Australia',
    type: 'city',
    viewport: { latitude: -33.8688, longitude: 151.2093, zoom: 11 },
    bounds: { north: -33.58, south: -34.12, east: 151.34, west: 150.52 },
    countryCodes: ['AU'],
    cities: ['sydney'],
    parent: 'australia',
  },
];

/**
 * Get a region by ID
 */
export function getRegionById(id: string): GeographicRegion | undefined {
  return GEOGRAPHIC_REGIONS.find((r) => r.id === id);
}

/**
 * Get all regions of a specific type
 */
export function getRegionsByType(type: GeographicRegion['type']): GeographicRegion[] {
  return GEOGRAPHIC_REGIONS.filter((r) => r.type === type);
}

/**
 * Get child regions of a parent region
 */
export function getChildRegions(parentId: string): GeographicRegion[] {
  return GEOGRAPHIC_REGIONS.filter((r) => r.parent === parentId);
}

/**
 * Check if coordinates are within region bounds
 */
export function isInRegion(
  lat: number,
  lng: number,
  region: GeographicRegion
): boolean {
  if (!region.bounds) return false;
  const { north, south, east, west } = region.bounds;
  return lat <= north && lat >= south && lng <= east && lng >= west;
}

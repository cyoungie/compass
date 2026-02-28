/**
 * Google Maps Places API (Text Search) and Geocoding.
 * Uses zip code to get lat/lng + city/county/state via Geocoding, then nearby search.
 */
import { config } from '../constants/config';
import type { PlaceResource, LocationFromZip } from '../types';

const PLACE_TYPES = {
  food_bank: 'food_bank',
  shelter: 'lodging',
  fqhc: 'health',
} as const;

type AddressComponent = { long_name: string; short_name: string; types: string[] };

function parseGeocodeResult(result: Record<string, unknown>): LocationFromZip | null {
  const geometry = result.geometry as { location?: { lat: number; lng: number } } | undefined;
  const loc = geometry?.location;
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;

  const components = (result.address_components as AddressComponent[] | undefined) ?? [];
  const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name;
  const getShort = (type: string) => components.find((c) => c.types.includes(type))?.short_name;

  const country = getShort('country') ?? '';
  const isUS = country === 'US';

  return {
    lat: loc.lat,
    lng: loc.lng,
    city: get('locality') ?? get('sublocality') ?? get('sublocality_level_1'),
    county: get('administrative_area_level_2'),
    state: getShort('administrative_area_level_1') ?? get('administrative_area_level_1'),
    country,
    isUS,
  };
}

/**
 * Geocode a zip code and return location with city, county, state; validates US.
 */
export async function geocodeZipToLocation(zipCode: string): Promise<LocationFromZip | null> {
  const key = config.googleMapsApiKey;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zipCode)}&components=country:US&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;
  return parseGeocodeResult(result);
}

async function geocodeZip(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  const loc = await geocodeZipToLocation(zipCode);
  if (!loc) return null;
  return { lat: loc.lat, lng: loc.lng };
}

/** Haversine distance in miles. */
function distanceMi(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function searchPlaces(
  originLat: number,
  originLng: number,
  query: string,
  type?: string
): Promise<PlaceResource[]> {
  const key = config.googleMapsApiKey;
  if (!key) return [];
  const typeParam = type ? `&type=${type}` : '';
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${originLat},${originLng}&key=${key}${typeParam}`;
  const res = await fetch(url);
  const data = await res.json();
  const results = data.results ?? [];
  return results.slice(0, 10).map((p: Record<string, unknown>) => {
    const geo = p.geometry as { location?: { lat: number; lng: number } } | undefined;
    const loc = geo?.location;
    let distance = '';
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      const mi = distanceMi(originLat, originLng, loc.lat, loc.lng);
      distance = `${mi < 0.1 ? '<0.1' : mi.toFixed(1)} mi`;
    }
    return {
      name: (p.name as string) ?? 'Unknown',
      address: (p.formatted_address as string) ?? '',
      distance,
      phone: undefined as string | undefined,
      placeId: p.place_id as string | undefined,
    };
  });
}

export async function getNearbyResources(zipCode: string): Promise<{
  foodBanks: PlaceResource[];
  shelters: PlaceResource[];
  fqhcs: PlaceResource[];
}> {
  const loc = await geocodeZip(zipCode);
  if (!loc) {
    return { foodBanks: [], shelters: [], fqhcs: [] };
  }
  const [foodBanks, shelters, fqhcs] = await Promise.all([
    searchPlaces(loc.lat, loc.lng, 'food bank', PLACE_TYPES.food_bank),
    searchPlaces(loc.lat, loc.lng, 'homeless shelter', PLACE_TYPES.shelter),
    searchPlaces(loc.lat, loc.lng, 'FQHC community health center', PLACE_TYPES.fqhc),
  ]);
  return { foodBanks, shelters, fqhcs };
}

/**
 * Get all place-based resources for a location (US only). Includes legal and clothing.
 */
export async function getPlacesByLocation(loc: LocationFromZip): Promise<{
  foodBanks: PlaceResource[];
  shelters: PlaceResource[];
  fqhcs: PlaceResource[];
  legalAid: PlaceResource[];
  clothing: PlaceResource[];
}> {
  if (!loc.isUS) {
    return { foodBanks: [], shelters: [], fqhcs: [], legalAid: [], clothing: [] };
  }
  const { lat, lng } = loc;
  const [foodBanks, shelters, fqhcs, legalAid, clothing] = await Promise.all([
    searchPlaces(lat, lng, 'food bank', PLACE_TYPES.food_bank),
    searchPlaces(lat, lng, 'homeless shelter', PLACE_TYPES.shelter),
    searchPlaces(lat, lng, 'FQHC community health center', PLACE_TYPES.fqhc),
    searchPlaces(lat, lng, 'free legal aid'),
    searchPlaces(lat, lng, 'free clothing bank community closet'),
  ]);
  return { foodBanks, shelters, fqhcs, legalAid, clothing };
}

/**
 * Optional: get place details for phone number (requires Places Details API).
 */
export async function getPlacePhone(placeId: string): Promise<string | undefined> {
  const key = config.googleMapsApiKey;
  if (!key) return undefined;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result?.formatted_phone_number;
}

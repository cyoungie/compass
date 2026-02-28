/**
 * Google Maps Places API (Text Search) to find places by type and location.
 * Uses zip code to get lat/lng via Geocoding, then nearby search.
 */
import { config } from '../constants/config';
import type { PlaceResource } from '../types';

const PLACE_TYPES = {
  food_bank: 'food_bank',
  shelter: 'lodging', // generic; no "shelter" type in Places
  fqhc: 'health',
} as const;

async function geocodeZip(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  const key = config.googleMapsApiKey;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zipCode)}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  if (!loc) return null;
  return { lat: loc.lat, lng: loc.lng };
}

async function searchPlaces(
  lat: number,
  lng: number,
  query: string,
  type?: string
): Promise<PlaceResource[]> {
  const key = config.googleMapsApiKey;
  if (!key) return [];
  const typeParam = type ? `&type=${type}` : '';
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&key=${key}${typeParam}`;
  const res = await fetch(url);
  const data = await res.json();
  const results = data.results ?? [];
  return results.slice(0, 10).map((p: Record<string, unknown>) => ({
    name: (p.name as string) ?? 'Unknown',
    address: (p.formatted_address as string) ?? '',
    distance: '', // Text Search doesn't return distance; could compute from lat/lng
    phone: undefined,
    placeId: p.place_id as string | undefined,
  }));
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

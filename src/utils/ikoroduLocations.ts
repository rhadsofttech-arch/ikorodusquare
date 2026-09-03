import { IkoroduArea } from '../types';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

// Canonical GPS coordinates (centroids) for recognized Ikorodu communities/districts
export const IKORODU_AREA_COORDINATES: Record<IkoroduArea, GeoCoordinate> = {
  Sabo: { latitude: 6.6194, longitude: 3.5105 },
  Garage: { latitude: 6.615, longitude: 3.507 },
  Agric: { latitude: 6.6028, longitude: 3.4886 },
  Ebute: { latitude: 6.6074, longitude: 3.493 },
  Ayetoro: { latitude: 6.623, longitude: 3.506 },
  Igbogbo: { latitude: 6.5822, longitude: 3.5135 },
  Imota: { latitude: 6.661, longitude: 3.67 },
  Ijede: { latitude: 6.57, longitude: 3.595 },
  Ipakodo: { latitude: 6.601, longitude: 3.475 },
  Offin: { latitude: 6.575, longitude: 3.472 },
  'Ota-Ona': { latitude: 6.628, longitude: 3.515 },
  'Ita-Elewa': { latitude: 6.621, longitude: 3.511 },
  Aga: { latitude: 6.616, longitude: 3.504 },
  Isawo: { latitude: 6.635, longitude: 3.468 },
  Odogunyan: { latitude: 6.658, longitude: 3.532 },
  Maya: { latitude: 6.672, longitude: 3.551 },
  Adamo: { latitude: 6.678, longitude: 3.568 },
  Gberigbe: { latitude: 6.635, longitude: 3.585 },
  'Maya-Itaoluwo': { latitude: 6.67, longitude: 3.545 },
  Ibeshe: { latitude: 6.592, longitude: 3.489 },
  Agura: { latitude: 6.685, longitude: 3.62 },
  Egbin: { latitude: 6.565, longitude: 3.612 },
  Oreta: { latitude: 6.568, longitude: 3.522 },
  Bayeku: { latitude: 6.561, longitude: 3.538 },
  Owutu: { latitude: 6.618, longitude: 3.485 },
  Ogijo: { latitude: 6.695, longitude: 3.525 },
  Ladega: { latitude: 6.618, longitude: 3.508 },
  Benson: { latitude: 6.612, longitude: 3.501 },
  Solebo: { latitude: 6.61, longitude: 3.512 },
  Isiu: { latitude: 6.68, longitude: 3.605 },
  Agbowa: { latitude: 6.65, longitude: 3.7 },
  Itoikin: { latitude: 6.63, longitude: 3.79 },
  Itamaga: { latitude: 6.632, longitude: 3.526 },
  Parafa: { latitude: 6.645, longitude: 3.548 },
  'Grammar School': { latitude: 6.624, longitude: 3.518 },
  Gbaga: { latitude: 6.648, longitude: 3.56 },
  Mowokekere: { latitude: 6.655, longitude: 3.57 },
  Radio: { latitude: 6.639, longitude: 3.535 },
  Araromi: { latitude: 6.615, longitude: 3.519 },
  Eyita: { latitude: 6.626, longitude: 3.52 },
};

// Default center of Ikorodu metropolis (Ayangburen Palace / Sabo Market junction)
export const DEFAULT_IKORODU_CENTER: GeoCoordinate = {
  latitude: 6.6194,
  longitude: 3.5105,
};

/**
 * Calculates great-circle distance between two GPS points using the Haversine formula.
 * Returns distance in kilometers (rounded to 1 decimal place).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 999;
  }

  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Formats a distance in km for clear user display.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000));
    return `${meters}m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Resolves coordinate for an entity:
 * 1. Checks specific entity coordinates (latitude, longitude) if provided.
 * 2. Falls back safely to recognized Ikorodu area centroid.
 * 3. Falls back to default Ikorodu center.
 */
export function getEntityCoordinates(
  area?: string,
  latitude?: number | null,
  longitude?: number | null
): GeoCoordinate {
  if (
    typeof latitude === 'number' &&
    !isNaN(latitude) &&
    typeof longitude === 'number' &&
    !isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0
  ) {
    return { latitude, longitude };
  }

  if (area && area in IKORODU_AREA_COORDINATES) {
    return IKORODU_AREA_COORDINATES[area as IkoroduArea];
  }

  return DEFAULT_IKORODU_CENTER;
}

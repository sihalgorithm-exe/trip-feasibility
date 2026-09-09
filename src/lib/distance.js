/**
 * distance.js
 * Pure functions for geographic distance calculation.
 * No side effects: safe to unit test or port directly to Java later.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * calculateDistance
 * Haversine great-circle distance between two lat/lng points.
 * @param {{latitude:number, longitude:number}} pointA
 * @param {{latitude:number, longitude:number}} pointB
 * @returns {number} distance in kilometers
 */
export function calculateDistance(pointA, pointB) {
  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);
  const deltaLat = toRadians(pointB.latitude - pointA.latitude);
  const deltaLon = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * buildDistanceMatrix
 * Precomputes pairwise distances for a list of destinations so route
 * calculation doesn't recompute Haversine repeatedly.
 * @param {Array<{id:number|string, latitude:number, longitude:number}>} destinations
 * @returns {Map<string, number>} key = "idA|idB" (order-independent), value = km
 */
export function buildDistanceMatrix(destinations) {
  const matrix = new Map();
  for (let i = 0; i < destinations.length; i++) {
    for (let j = i + 1; j < destinations.length; j++) {
      const a = destinations[i];
      const b = destinations[j];
      const km = calculateDistance(a, b);
      const key = [a.id, b.id].sort().join('|');
      matrix.set(key, km);
    }
  }
  return matrix;
}

export function getDistanceFromMatrix(matrix, idA, idB) {
  const key = [idA, idB].sort().join('|');
  return matrix.get(key);
}

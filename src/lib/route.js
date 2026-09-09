/**
 * route.js
 * MVP route ordering: start from the first selected destination, then
 * choose an efficient ordering of the rest.
 *
 * Strategy:
 * - If destinations.length <= 6: brute-force all permutations of the
 *   remaining stops (fixing the first stop) and pick the shortest total
 *   distance. 6 stops => 120 permutations, trivial to compute.
 * - If destinations.length > 6: fall back to a nearest-neighbor greedy
 *   heuristic to avoid factorial blowup. Good enough for an SIH MVP;
 *   swap for a real TSP solver later if needed.
 */

import { calculateDistance } from './distance.js';

const BRUTE_FORCE_LIMIT = 6;

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

function routeTotalDistance(orderedStops) {
  let total = 0;
  for (let i = 0; i < orderedStops.length - 1; i++) {
    total += calculateDistance(orderedStops[i], orderedStops[i + 1]);
  }
  return total;
}

function nearestNeighborRoute(destinations) {
  const [first, ...rest] = destinations;
  const route = [first];
  const remaining = [...rest];

  while (remaining.length > 0) {
    const current = route[route.length - 1];
    let nearestIndex = 0;
    let nearestDist = Infinity;
    remaining.forEach((dest, idx) => {
      const d = calculateDistance(current, dest);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIndex = idx;
      }
    });
    route.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }
  return route;
}

/**
 * calculateRoute
 * @param {Array} destinations - selected destinations, order as picked by user
 * @returns {{ orderedDestinations: Array, legs: Array<{from, to, distanceKm}>, totalDistanceKm: number }}
 */
export function calculateRoute(destinations) {
  if (!destinations || destinations.length === 0) {
    return { orderedDestinations: [], legs: [], totalDistanceKm: 0 };
  }
  if (destinations.length === 1) {
    return { orderedDestinations: [...destinations], legs: [], totalDistanceKm: 0 };
  }

  let bestRoute;

  if (destinations.length <= BRUTE_FORCE_LIMIT) {
    const [first, ...rest] = destinations;
    let bestDistance = Infinity;
    bestRoute = [first, ...rest];

    for (const perm of permutations(rest)) {
      const candidate = [first, ...perm];
      const dist = routeTotalDistance(candidate);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestRoute = candidate;
      }
    }
  } else {
    bestRoute = nearestNeighborRoute(destinations);
  }

  const legs = [];
  for (let i = 0; i < bestRoute.length - 1; i++) {
    const from = bestRoute[i];
    const to = bestRoute[i + 1];
    legs.push({
      from,
      to,
      distanceKm: calculateDistance(from, to),
    });
  }

  const totalDistanceKm = legs.reduce((sum, leg) => sum + leg.distanceKm, 0);

  return { orderedDestinations: bestRoute, legs, totalDistanceKm };
}

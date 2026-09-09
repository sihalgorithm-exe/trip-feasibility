/**
 * time.js
 * Converts route legs and visit durations into required-time figures.
 */

export const AVERAGE_TRAVEL_SPEED_KMPH = 40;

/**
 * calculateTravelTime
 * @param {number} distanceKm
 * @param {number} avgSpeedKmph
 * @returns {number} hours
 */
export function calculateTravelTime(distanceKm, avgSpeedKmph = AVERAGE_TRAVEL_SPEED_KMPH) {
  if (avgSpeedKmph <= 0) throw new Error('avgSpeedKmph must be positive');
  return distanceKm / avgSpeedKmph;
}

/**
 * calculateTotalRequiredTime
 * @param {Array} destinations - each has visitDurationHours
 * @param {Array<{distanceKm:number}>} legs - route legs from calculateRoute
 * @param {number} avgSpeedKmph
 * @returns {{ totalVisitHours:number, totalTravelHours:number, totalRequiredHours:number }}
 */
export function calculateTotalRequiredTime(destinations, legs, avgSpeedKmph = AVERAGE_TRAVEL_SPEED_KMPH) {
  const totalVisitHours = destinations.reduce(
    (sum, d) => sum + (Number(d.visitDurationHours) || 0),
    0
  );

  const totalTravelHours = legs.reduce(
    (sum, leg) => sum + calculateTravelTime(leg.distanceKm, avgSpeedKmph),
    0
  );

  return {
    totalVisitHours,
    totalTravelHours,
    totalRequiredHours: totalVisitHours + totalTravelHours,
  };
}

export function calculateTotalAvailableHours(numberOfDays, hoursPerDay) {
  return numberOfDays * hoursPerDay;
}

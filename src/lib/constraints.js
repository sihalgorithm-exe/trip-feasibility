/**
 * constraints.js
 * Checks distance and time thresholds and produces human-readable issues.
 */

export const MAX_RECOMMENDED_DISTANCE_KM = 120;

/**
 * checkDistanceConstraints
 * @param {Array<{from, to, distanceKm}>} legs
 * @param {number} maxDistanceKm
 * @returns {Array<{type:'distance', from:string, to:string, distanceKm:number, message:string}>}
 */
export function checkDistanceConstraints(legs, maxDistanceKm = MAX_RECOMMENDED_DISTANCE_KM) {
  const issues = [];
  for (const leg of legs) {
    if (leg.distanceKm > maxDistanceKm) {
      issues.push({
        type: 'distance',
        from: leg.from.name,
        to: leg.to.name,
        distanceKm: Number(leg.distanceKm.toFixed(1)),
        message: `${leg.from.name} → ${leg.to.name} is approximately ${leg.distanceKm.toFixed(
          1
        )} km, which exceeds Wayfare's recommended ${maxDistanceKm} km destination radius.`,
      });
    }
  }
  return issues;
}

/**
 * checkTimeConstraints
 * @param {number} totalRequiredHours
 * @param {number} totalAvailableHours
 * @returns {Array<{type:'time', requiredHours:number, availableHours:number, message:string}>}
 */
export function checkTimeConstraints(totalRequiredHours, totalAvailableHours) {
  const issues = [];
  if (totalRequiredHours > totalAvailableHours) {
    issues.push({
      type: 'time',
      requiredHours: Number(totalRequiredHours.toFixed(1)),
      availableHours: Number(totalAvailableHours.toFixed(1)),
      message: `Your selected destinations require approximately ${totalRequiredHours.toFixed(
        1
      )} hours, but you have only ${totalAvailableHours.toFixed(1)} hours available.`,
    });
  }
  return issues;
}

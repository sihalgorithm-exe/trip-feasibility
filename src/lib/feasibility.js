/**
 * feasibility.js
 * Orchestrates route, time, and constraint modules into one deterministic
 * evaluation. This is the single entry point the UI (and later, the
 * Spring Boot backend) should call.
 */

import { calculateRoute } from './route.js';
import {
  calculateTotalRequiredTime,
  calculateTotalAvailableHours,
  AVERAGE_TRAVEL_SPEED_KMPH,
} from './time.js';
import {
  checkDistanceConstraints,
  checkTimeConstraints,
  MAX_RECOMMENDED_DISTANCE_KM,
} from './constraints.js';

/**
 * evaluateFeasibility
 * @param {{
 *   trip: { numberOfDays: number, hoursPerDay: number },
 *   destinations: Array<{ id, name, latitude, longitude, visitDurationHours }>
 * }} input
 * @param {{ maxDistanceKm?: number, avgSpeedKmph?: number }} [options]
 * @returns {object} structured feasibility result
 */
export function evaluateFeasibility(input, options = {}) {
  const { trip, destinations } = input;
  const maxDistanceKm = options.maxDistanceKm ?? MAX_RECOMMENDED_DISTANCE_KM;
  const avgSpeedKmph = options.avgSpeedKmph ?? AVERAGE_TRAVEL_SPEED_KMPH;

  if (!destinations || destinations.length === 0) {
    throw new Error('At least one destination is required');
  }
  if (!trip || !trip.numberOfDays || !trip.hoursPerDay) {
    throw new Error('trip.numberOfDays and trip.hoursPerDay are required');
  }

  const { orderedDestinations, legs, totalDistanceKm } = calculateRoute(destinations);

  const { totalVisitHours, totalTravelHours, totalRequiredHours } =
    calculateTotalRequiredTime(orderedDestinations, legs, avgSpeedKmph);

  const totalAvailableHours = calculateTotalAvailableHours(trip.numberOfDays, trip.hoursPerDay);

  const distanceIssues = checkDistanceConstraints(legs, maxDistanceKm);
  const timeIssues = checkTimeConstraints(totalRequiredHours, totalAvailableHours);

  const feasible = distanceIssues.length === 0 && timeIssues.length === 0;

  return {
    feasible,
    numberOfDays: trip.numberOfDays,
    hoursPerDay: trip.hoursPerDay,
    totalAvailableHours: Number(totalAvailableHours.toFixed(2)),
    estimatedRequiredHours: Number(totalRequiredHours.toFixed(2)),
    remainingHours: Number((totalAvailableHours - totalRequiredHours).toFixed(2)),
    breakdown: {
      totalVisitHours: Number(totalVisitHours.toFixed(2)),
      totalTravelHours: Number(totalTravelHours.toFixed(2)),
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    },
    maxDistanceKm,
    avgSpeedKmph,
    route: orderedDestinations,
    legs: legs.map((leg) => ({
      from: leg.from.name,
      to: leg.to.name,
      distanceKm: Number(leg.distanceKm.toFixed(1)),
    })),
    distanceIssues,
    timeIssues,
  };
}

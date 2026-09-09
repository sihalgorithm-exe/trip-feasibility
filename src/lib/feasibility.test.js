import { describe, it, expect } from 'vitest';
import { calculateDistance } from './distance.js';
import { calculateRoute } from './route.js';
import { evaluateFeasibility } from './feasibility.js';
import {
  FEASIBLE_TRIP_EXAMPLE,
  INFEASIBLE_DISTANCE_EXAMPLE,
  INFEASIBLE_TIME_EXAMPLE,
} from './sampleData.js';

describe('calculateDistance', () => {
  it('returns 0 for identical points', () => {
    const p = { latitude: 16.5, longitude: 80.6 };
    expect(calculateDistance(p, p)).toBeCloseTo(0, 5);
  });

  it('matches known distance between Vijayawada and Visakhapatnam (~220km)', () => {
    const a = { latitude: 16.506, longitude: 80.648 };
    const b = { latitude: 17.686, longitude: 83.218 };
    const d = calculateDistance(a, b);
    expect(d).toBeGreaterThan(280);
    expect(d).toBeLessThan(330);
  });
});

describe('calculateRoute', () => {
  it('keeps the first destination fixed as the start', () => {
    const { orderedDestinations } = calculateRoute(FEASIBLE_TRIP_EXAMPLE.destinations);
    expect(orderedDestinations[0].id).toBe(FEASIBLE_TRIP_EXAMPLE.destinations[0].id);
  });

  it('produces n-1 legs for n destinations', () => {
    const { legs } = calculateRoute(FEASIBLE_TRIP_EXAMPLE.destinations);
    expect(legs.length).toBe(FEASIBLE_TRIP_EXAMPLE.destinations.length - 1);
  });
});

describe('evaluateFeasibility', () => {
  it('marks a nearby, well-timed trip as feasible', () => {
    const result = evaluateFeasibility(FEASIBLE_TRIP_EXAMPLE);
    expect(result.feasible).toBe(true);
    expect(result.distanceIssues.length).toBe(0);
    expect(result.timeIssues.length).toBe(0);
  });

  it('marks a trip with >120km leg as not feasible', () => {
    const result = evaluateFeasibility(INFEASIBLE_DISTANCE_EXAMPLE);
    expect(result.feasible).toBe(false);
    expect(result.distanceIssues.length).toBeGreaterThan(0);
  });

  it('marks a trip exceeding available hours as not feasible', () => {
    const result = evaluateFeasibility(INFEASIBLE_TIME_EXAMPLE);
    expect(result.feasible).toBe(false);
    expect(result.timeIssues.length).toBeGreaterThan(0);
  });

  it('throws on missing destinations', () => {
    expect(() => evaluateFeasibility({ trip: { numberOfDays: 1, hoursPerDay: 4 }, destinations: [] })).toThrow();
  });
});

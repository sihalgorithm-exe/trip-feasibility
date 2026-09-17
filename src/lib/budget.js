/**
 * budget.js
 * Deterministic budget layer - the ONLY place transport-cost math happens.
 * Entirely optional: if no totalBudget was provided, calculateBudget
 * returns null and nothing downstream changes behavior.
 */

/**
 * Finds the matching travelEstimates rows for one leg of the route.
 * Same-city legs match against 'local' rows; different-city legs match
 * either direction (A->B or B->A), since a fare doesn't depend on order.
 */
function findMatches(leg, travelEstimates) {
  const fromCity = leg.from.city;
  const toCity = leg.to.city;

  if (!fromCity || !toCity) return [];

  if (fromCity === toCity) {
    return travelEstimates.filter(
      (e) => e.transportMode === 'local' && e.fromCity === fromCity
    );
  }

  return travelEstimates.filter(
    (e) =>
      e.transportMode !== 'local' &&
      ((e.fromCity === fromCity && e.toCity === toCity) ||
        (e.fromCity === toCity && e.toCity === fromCity))
  );
}

/**
 * calculateBudget
 * @param {object} params
 * @param {number|null} params.totalBudget - INR, or null/undefined if the user skipped it
 * @param {Array} params.legs - route legs from calculateRoute() (each has .from, .to with .city)
 * @param {Array} params.travelEstimates - raw curated rows passed through from Wayfare
 * @returns {object|null} budget result, or null if no budget was provided
 */
export function calculateBudget({ totalBudget, legs, travelEstimates = [] }) {
  if (totalBudget === undefined || totalBudget === null || totalBudget === '') {
    return null;
  }

  const numericBudget = Number(totalBudget);

  if (!Number.isFinite(numericBudget) || numericBudget < 0) {
    return {
      totalBudget: numericBudget,
      valid: false,
      message: 'The entered budget is not a valid amount. Please enter a positive number.',
    };
  }

  let minTotal = 0;
  let maxTotal = 0;
  const legEstimates = [];
  const unresolvedLegs = [];

  for (const leg of legs) {
    const matches = findMatches(leg, travelEstimates);

    if (matches.length === 0) {
      unresolvedLegs.push({ from: leg.from.name, to: leg.to.name });
      continue;
    }

    // Default to the cheapest available mode for the budget math (a
    // budget-conscious traveler would pick it); all matched modes are
    // still exposed below for transparency in the UI.
    const cheapest = matches.reduce((a, b) => (a.minCost <= b.minCost ? a : b));

    minTotal += cheapest.minCost;
    maxTotal += cheapest.maxCost;

    legEstimates.push({
      from: leg.from.name,
      to: leg.to.name,
      usedMode: cheapest.transportMode,
      minCost: cheapest.minCost,
      maxCost: cheapest.maxCost,
      availableModes: matches.map((m) => ({
        mode: m.transportMode,
        minCost: m.minCost,
        maxCost: m.maxCost,
      })),
    });
  }

  const remainingMin = Math.max(0, numericBudget - maxTotal);
  const remainingMax = Math.max(0, numericBudget - minTotal);

  let verdict = 'ok';
  if (minTotal > numericBudget) {
    verdict = 'travel_exceeds_budget';
  } else if (remainingMin === 0 || (numericBudget - minTotal) < minTotal * 0.5) {
    // Remaining budget (worst case) is zero, or is less than half of what
    // travel alone costs at best case - flag as tight rather than silently
    // presenting a comfortable-looking number.
    verdict = 'tight';
  }

  return {
    valid: true,
    totalBudget: numericBudget,
    estimatedTravelCost: { min: Math.round(minTotal), max: Math.round(maxTotal) },
    remainingBudget: { min: Math.round(remainingMin), max: Math.round(remainingMax) },
    legEstimates,
    unresolvedLegs,
    hasUnresolvedLegs: unresolvedLegs.length > 0,
    verdict, // 'ok' | 'tight' | 'travel_exceeds_budget'
  };
}
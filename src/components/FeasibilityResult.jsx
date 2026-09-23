import TripSummary from './TripSummary.jsx';
import DestinationRoute from './DestinationRoute.jsx';

// These are TWO separately deployed apps (see wayfare-ai-backend's own
// tripSessionStore.js comments) and must never share one URL:
//  - AI_BACKEND_URL  -> the Express API (POST /api/trips)
//  - AI_FRONTEND_URL -> the React planner UI (the page the browser lands on)
const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL;
const AI_FRONTEND_URL = import.meta.env.VITE_AI_FRONTEND_URL;

// Destinations carry a `city` field (see Wayfare's mapDestinationToFeasibility).
// The AI Planner's schema requires trip.city, so we derive it from whichever
// city appears most often among the selected destinations.
function deriveTripCity(route) {
  const counts = {};
  for (const dest of route) {
    if (!dest.city) continue;
    counts[dest.city] = (counts[dest.city] || 0) + 1;
  }
  const entries = Object.entries(counts);
  if (entries.length === 0) return undefined;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export default function FeasibilityResult({
  result,
  payload,
  onChangeDestinations,
}) {
  const { feasible } = result;

  const handlePlanWithAI = async () => {
    try {
      if (!AI_BACKEND_URL || !AI_FRONTEND_URL) {
        throw new Error(
          'VITE_AI_BACKEND_URL and/or VITE_AI_FRONTEND_URL is not set in this build. ' +
          'Set both in Render\u2019s environment variables for the feasibility checker, ' +
          'then trigger a fresh deploy (env changes require a rebuild, not just a restart).'
        );
      }

      const city = deriveTripCity(result.route);
      // `payload.hotels` was already built by Wayfare's buildFeasibilityPayload
      // (see sih-tourism-frontend/src/utils/feasibility.js): it's already
      // scoped to this trip's city (via city-centroid matching) and already
      // has properly-parsed numeric pricePerNight/rating and an amenities
      // array, exactly matching the AI Planner's schema. Re-fetching raw
      // hotels here and re-filtering them was redundant and, because most
      // hotel records have no latitude/longitude of their own (see the
      // comment in buildFeasibilityPayload), incorrectly dropped every hotel.
      const hotels = payload.hotels || [];

      if (hotels.length === 0) {
        throw new Error(
          city
            ? `Could not find any hotels in ${city} to recommend. Try different destinations or check back later.`
            : 'Could not determine which city this trip is in, so hotels can\u2019t be suggested.'
        );
      }

      const tripInput = {
        ...payload,

        trip: {
          ...payload.trip,
          city,
          numberOfDays: result.numberOfDays,
          hoursPerDay: result.hoursPerDay,
        },

        destinations: result.route,

        route: result.legs,

              feasibility: {
        feasible: result.feasible,
        estimatedRequiredHours: result.estimatedRequiredHours,
        availableHours: result.totalAvailableHours,
      },

      hotels,

      budget: result.budget || null,
    };

      const response = await fetch(
        `${AI_BACKEND_URL}/api/trips`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tripInput),
        }
      );

            const data = await response.json();

      if (!response.ok) {
        const detail = Array.isArray(data.details)
          ? data.details.map((d) => `${d.instancePath || '(root)'} ${d.message}`).join('; ')
          : '';
        console.error('AI backend rejected trip input:', data);
        throw new Error(detail ? `${data.error}: ${detail}` : (data.error || 'Could not start AI planning.'));
      }
      if (!data.sessionId) {
        throw new Error('AI backend did not return a session id.');
      }

      window.location.href = `${AI_FRONTEND_URL}/plan/${data.sessionId}`;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not start AI planning.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Feasibility banner */}
      <div
        className={`rounded-2xl p-6 flex items-start gap-4 border ${
          feasible
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div
          className={`text-3xl leading-none ${feasible ? 'text-emerald-600' : 'text-amber-600'}`}
        >
          {feasible ? '✓' : '⚠'}
        </div>
        <div>
          <h2
            className={`text-xl font-semibold ${
              feasible ? 'text-emerald-800' : 'text-amber-800'
            }`}
          >
            {feasible ? 'Trip Recommended' : 'Trip Not Recommended'}
          </h2>
          <p className="text-sm mt-1 text-slate-600">
            {feasible
              ? 'Your selected destinations can reasonably fit into your planned trip.'
              : 'Here\u2019s why this combination needs a tweak before we can plan it with the Planner AI.'}
          </p>
        </div>
      </div>

      <TripSummary result={result} destinationCount={result.route.length} />

      {/* Reasoning */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          How we calculated this
        </h3>
        <div className="text-sm text-slate-700 space-y-1">
          <p>
            Estimated time required:{' '}
            <span className="font-medium">{result.estimatedRequiredHours} hrs</span>{' '}
            (visiting + traveling)
          </p>
          <p>
            Time available: <span className="font-medium">{result.totalAvailableHours} hrs</span>
          </p>
          <p>
            {result.remainingHours >= 0 ? 'Buffer remaining' : 'Shortfall'}:{' '}
            <span className={`font-medium ${result.remainingHours < 0 ? 'text-amber-700' : ''}`}>
              {Math.abs(result.remainingHours)} hrs
            </span>
          </p>
        </div>

        {(!feasible) && (
          <div className="mt-4 space-y-2">
            {result.distanceIssues.map((issue, i) => (
              <div key={`d-${i}`} className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                {issue.message}
              </div>
            ))}
            {result.timeIssues.map((issue, i) => (
              <div key={`t-${i}`} className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                {issue.message}
              </div>
            ))}
          </div>
        )}
      </div>

            {result.budget && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Budget estimate
          </h3>

          {!result.budget.valid ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {result.budget.message}
            </p>
          ) : (
            <>
              <div className="text-sm text-slate-700 space-y-1">
                <p>Total budget: <span className="font-medium">₹{result.budget.totalBudget.toLocaleString('en-IN')}</span></p>
                <p>
                  Estimated travel cost:{' '}
                  <span className="font-medium">
                    ₹{result.budget.estimatedTravelCost.min.toLocaleString('en-IN')}–₹{result.budget.estimatedTravelCost.max.toLocaleString('en-IN')}
                  </span>
                </p>
                <p>
                  Remaining for the rest of the trip:{' '}
                  <span className="font-medium">
                    ₹{result.budget.remainingBudget.min.toLocaleString('en-IN')}–₹{result.budget.remainingBudget.max.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                These are approximate ranges based on curated transport estimates, not live fares - actual costs can vary.
              </p>

              {result.budget.verdict === 'travel_exceeds_budget' && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  Even at the cheapest estimated option, transport alone is likely to exceed your budget.
                  Consider increasing your budget or choosing destinations that are closer together.
                </p>
              )}

              {result.budget.verdict === 'tight' && result.budget.verdict !== 'travel_exceeds_budget' && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  Your remaining budget after transport is quite small - accommodation and food options may be limited.
                </p>
              )}

              {result.budget.hasUnresolvedLegs && (
                <p className="text-xs text-slate-500 mt-3">
                  No fare data available yet for: {result.budget.unresolvedLegs.map((l) => `${l.from} → ${l.to}`).join(', ')}. This leg isn't included in the estimate above.
                </p>
              )}
            </>
          )}
        </div>
      )}
      <DestinationRoute route={result.route} legs={result.legs} />

      {/* CTA */}
      <div className="flex justify-center pt-2">
        {feasible ? (
          <button
            onClick={handlePlanWithAI}
            className="bg-wayfare-600 hover:bg-wayfare-700 text-white font-medium px-8 py-3 rounded-xl shadow-md transition"
          >
            ✨ Plan My Trip with AI
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onChangeDestinations}
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-6 py-3 rounded-xl transition"
            >
              ← Change Destinations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
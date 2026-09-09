import TripSummary from './TripSummary.jsx';
import DestinationRoute from './DestinationRoute.jsx';

const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL || 'https://wayfare-ai-planner.example.com/plan';

export default function FeasibilityResult({ result, onChangeDestinations }) {
  const { feasible } = result;

  const handlePlanWithAI = () => {
    const params = new URLSearchParams({
      route: JSON.stringify(result.route),
      days: result.numberOfDays,
      hoursPerDay: result.hoursPerDay,
    });
    window.location.href = `${AI_AGENT_URL}?${params.toString()}`;
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

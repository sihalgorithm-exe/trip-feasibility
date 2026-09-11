// These are TWO separately deployed apps (see wayfare-ai-backend's own
// tripSessionStore.js comments) and must never share one URL:
//  - AI_BACKEND_URL  -> the Express API (POST /api/trips)
//  - AI_FRONTEND_URL -> the React planner UI (the page the browser lands on)
const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL;
const AI_FRONTEND_URL = import.meta.env.VITE_AI_FRONTEND_URL;

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

    const tripInput = {
      ...payload,

      trip: {
        ...payload.trip,
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
      throw new Error(data.error || 'Could not start AI planning.');
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
}
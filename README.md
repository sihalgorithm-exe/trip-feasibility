# Wayfare: Trip Feasibility Engine

Standalone React + Vite + Tailwind app that decides whether a user's
selected destinations form a reasonable trip, **before** handing off to
the AI travel-planning agent. All feasibility logic is deterministic
(no LLM calls) and lives in `src/lib/`, isolated from the UI so it can
be ported into the Spring Boot backend later with minimal changes.

## Project structure

```
src/
  lib/
    distance.js        # Haversine distance + distance matrix helper
    route.js            # Route ordering (brute-force ≤6 stops, else nearest-neighbor)
    time.js              # Travel time + total required time
    constraints.js      # Distance/time threshold checks -> human-readable issues
    feasibility.js       # evaluateFeasibility(): the single entry point
    parseInput.js        # URL/base64 payload parsing + validation
    sampleData.js        # Example feasible/infeasible payloads
    feasibility.test.js  # Vitest unit tests for the modules above
  components/
    Header.jsx
    TripInputForm.jsx     # Fallback demo UI when no payload is passed in
    TripSummary.jsx
    DestinationRoute.jsx
    FeasibilityResult.jsx # Main result screen incl. AI redirect / change-destinations CTA
  App.jsx
  main.jsx
```

## Setup

```bash
npm install
npm run dev       # http://localhost:5174
npm run build      # production build -> dist/
npm test           # run unit tests (vitest)
```

## How the main Wayfare app passes data in

This app expects a `?data=<base64>` query parameter containing the
JSON trip payload, URL-and-JSON-encoded. From the main React app:

```js
import { encodeTripPayload } from './lib/parseInput'; // copy this helper into the main app, or share the package

const payload = {
  trip: { numberOfDays: 2, hoursPerDay: 8 },
  destinations: [
    { id: 1, name: 'Undavalli Caves', latitude: 16.485, longitude: 80.556, visitDurationHours: 2 },
    { id: 2, name: 'Kondapalli Fort', latitude: 16.615, longitude: 80.542, visitDurationHours: 2 },
  ],
};

const encoded = encodeTripPayload(payload);
window.location.href = `https://feasibility.wayfare.app/?data=${encoded}`;
```

If you'd rather POST the payload to a small API route (e.g. a Spring
Boot endpoint that this app then fetches from on load), swap
`getTripPayloadFromUrl()` in `App.jsx` for a `fetch()` call: the rest
of the pipeline (`validateTripPayload` → `evaluateFeasibility`) is
unchanged either way.

## How this redirects to the AI agent

`FeasibilityResult.jsx` reads `VITE_AI_AGENT_URL` from the environment
(`.env` file, default is a placeholder) and redirects with the
computed route, day count, and hours/day as query params when the
trip is feasible:

```
VITE_AI_AGENT_URL=https://your-ai-agent.example.com/plan
```

If the trip is not feasible, no redirect happens: the user sees the
reasoning and a "Change Destinations" button that resets local state.

## Example payloads

See `src/lib/sampleData.js`:
- `FEASIBLE_TRIP_EXAMPLE`: 3 nearby Vijayawada-area spots, 2 days × 8 hrs → recommended
- `INFEASIBLE_DISTANCE_EXAMPLE`: Vijayawada → Visakhapatnam (~300 km) → rejected on distance
- `INFEASIBLE_TIME_EXAMPLE`: same 3 nearby spots but only 1 day × 4 hrs → rejected on time

## Porting to Spring Boot later

Every file in `src/lib/` (except `parseInput.js`, which is browser/URL
specific) is a pure function module with no React or DOM dependency.
The Haversine formula, route permutation/nearest-neighbor logic, and
threshold checks translate near line-for-line into Java service
classes (`DistanceService`, `RouteService`, `FeasibilityService`).

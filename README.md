# Wayfare Trip Feasibility

The Trip Feasibility Engine checks whether a user's selected destinations can reasonably fit into the available trip time before the AI planner creates an itinerary.

The important part of this project is that the feasibility decision is deterministic. It does not depend on an LLM.

## Highlights

- Calculates geographical distance between destinations
- Builds a practical visiting order
- Estimates travel and visit time
- Checks trip time constraints
- Checks distance constraints
- Explains why a trip is considered infeasible
- Uses deterministic logic instead of an AI model
- Can hand a feasible trip over to the AI planning service
- Includes unit tests for the core logic

## Overview

A trip planner should not ask an AI model to decide whether a group can physically cover a set of destinations within the available time.

This project handles that first step.

The selected destinations and trip details are passed to the feasibility engine. The engine calculates distances, creates a route, estimates the required time and checks the defined constraints.

If the trip passes the checks, the user can continue to the AI planning stage. If it does not, the user is shown the reason and can change the selected destinations.

The core logic is kept inside `src/lib/` so it can be tested separately from the React interface and can later be moved into the main Spring Boot backend.

## Usage

The main Wayfare application passes a trip to this application through a URL encoded payload. The application evaluates the trip and displays the result.

## Installation

```bash
git clone https://github.com/sihalgorithm-exe/trip-feasibility.git
cd trip-feasibility
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

Run tests with:

```bash
npm test
```

## How It Works

```text
Selected Destinations
        ↓
Validate Trip Data
        ↓
Calculate Distances
        ↓
Build Route
        ↓
Calculate Required Time
        ↓
Check Constraints
        ↓
   ┌────┴────┐
   ↓         ↓
Feasible  Infeasible
   ↓         ↓
AI Planner  Show Reason
```

For up to six stops, the route logic checks possible route orders. For larger trips, it uses a nearest neighbour approach.

Distance is currently calculated using the Haversine formula. It is a geographical estimate and does not represent live road traffic or road conditions.

## Example Cases

The repository includes cases of feasible trips, excessive distance and insufficient available time.

## Related Projects

- [Wayfare Frontend](https://github.com/sihalgorithm-exe/sih-tourism-frontend)
- [Wayfare Backend](https://github.com/sihalgorithm-exe/sih-tourism-backend)
- [Wayfare AI Frontend](https://github.com/sihalgorithm-exe/wayfare-ai-frontend)
- [Wayfare AI Backend](https://github.com/sihalgorithm-exe/wayfare-ai-backend)


## About

Wayfare is being developed by the `Algorithm.exe` team as part of Smart India Hackathon.



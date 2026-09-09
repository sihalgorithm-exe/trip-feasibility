/**
 * sampleData.js
 * Example payloads for demoing feasible / not-feasible trips.
 */

export const FEASIBLE_TRIP_EXAMPLE = {
  trip: { numberOfDays: 2, hoursPerDay: 8 },
  destinations: [
    { id: 1, name: 'Undavalli Caves', latitude: 16.485, longitude: 80.556, visitDurationHours: 2 },
    { id: 2, name: 'Kondapalli Fort', latitude: 16.615, longitude: 80.542, visitDurationHours: 2 },
    { id: 3, name: 'Bhavani Island', latitude: 16.516, longitude: 80.616, visitDurationHours: 1.5 },
  ],
};

export const INFEASIBLE_DISTANCE_EXAMPLE = {
  trip: { numberOfDays: 2, hoursPerDay: 8 },
  destinations: [
    { id: 1, name: 'Vijayawada', latitude: 16.506, longitude: 80.648, visitDurationHours: 2 },
    { id: 2, name: 'Visakhapatnam', latitude: 17.686, longitude: 83.218, visitDurationHours: 3 },
  ],
};

export const INFEASIBLE_TIME_EXAMPLE = {
  trip: { numberOfDays: 1, hoursPerDay: 4 },
  destinations: [
    { id: 1, name: 'Undavalli Caves', latitude: 16.485, longitude: 80.556, visitDurationHours: 2 },
    { id: 2, name: 'Kondapalli Fort', latitude: 16.615, longitude: 80.542, visitDurationHours: 2 },
    { id: 3, name: 'Bhavani Island', latitude: 16.516, longitude: 80.616, visitDurationHours: 1.5 },
  ],
};

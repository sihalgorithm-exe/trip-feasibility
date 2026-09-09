import { useState } from 'react';
import {
  FEASIBLE_TRIP_EXAMPLE,
  INFEASIBLE_DISTANCE_EXAMPLE,
  INFEASIBLE_TIME_EXAMPLE,
} from '../lib/sampleData.js';

/**
 * TripInputForm
 * Used only when no payload arrives via URL/API: lets a developer or
 * demo user try the engine directly. In production this screen is
 * skipped because Wayfare passes data automatically.
 */
export default function TripInputForm({ onSubmit }) {
  const [selected, setSelected] = useState('feasible');

  const examples = {
    feasible: FEASIBLE_TRIP_EXAMPLE,
    distance: INFEASIBLE_DISTANCE_EXAMPLE,
    time: INFEASIBLE_TIME_EXAMPLE,
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-xl font-semibold text-wayfare-900 mb-2">No trip data received</h2>
      <p className="text-slate-500 mb-6 text-sm">
        This screen normally loads automatically with destinations selected on Wayfare.
        For demo purposes, choose a sample scenario below.
      </p>

      <div className="space-y-3 mb-6">
        {[
          { key: 'feasible', label: 'Feasible trip example' },
          { key: 'distance', label: 'Infeasible: distance too large' },
          { key: 'time', label: 'Infeasible: not enough time' },
        ].map((opt) => (
          <label
            key={opt.key}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
              selected === opt.key
                ? 'border-wayfare-500 bg-wayfare-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="example"
              value={opt.key}
              checked={selected === opt.key}
              onChange={() => setSelected(opt.key)}
              className="accent-wayfare-600"
            />
            <span className="text-sm text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={() => onSubmit(examples[selected])}
        className="w-full bg-wayfare-600 hover:bg-wayfare-700 text-white font-medium py-3 rounded-xl transition"
      >
        Run Feasibility Check
      </button>
    </div>
  );
}

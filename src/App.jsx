import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import TripInputForm from './components/TripInputForm.jsx';
import FeasibilityResult from './components/FeasibilityResult.jsx';
import { getTripPayloadFromUrl, validateTripPayload } from './lib/parseInput.js';
import { evaluateFeasibility } from './lib/feasibility.js';

export default function App() {
  const [payload, setPayload] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // On mount, try to read trip data passed in from the main Wayfare app.
  useEffect(() => {
  const urlPayload = getTripPayloadFromUrl();

    if (!urlPayload) {
    const wayfareBase = (
      import.meta.env.VITE_WAYFARE_URL || 'https://sih-tourism-frontend.onrender.com'
    ).replace(/\/+$/, '');
    window.location.replace(`${wayfareBase}/recommendations`);
    return;
  }

  handleSubmit(urlPayload);
}, []);

  function handleSubmit(candidatePayload) {
    const { valid, error: validationError } = validateTripPayload(candidatePayload);
    if (!valid) {
      setError(validationError);
      return;
    }
    setError(null);
    setPayload(candidatePayload);
    const evaluation = evaluateFeasibility(candidatePayload);
    setResult(evaluation);
  }

    function handleChangeDestinations() {
  const wayfareBase = (
    import.meta.env.VITE_WAYFARE_URL || 'https://sih-tourism-frontend.onrender.com'
  ).replace(/\/+$/, ''); // strip any trailing slash so we don't get a double "//"

  window.location.replace(`${wayfareBase}/recommendations`);
}

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-4 py-10">
        {error && (
          <div className="max-w-xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            {error}
          </div>
        )}

        {!result && !error && (
  <div className="max-w-xl mx-auto mt-10 text-center text-slate-500">
    Loading trip feasibility...
  </div>
)}

        {result && (
          <FeasibilityResult
  result={result}
  payload={payload}
  onChangeDestinations={handleChangeDestinations}
/>
        )}
      </main>
    </div>
  );
}

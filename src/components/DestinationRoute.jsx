export default function DestinationRoute({ route, legs }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        Suggested Route
      </h3>
      <div className="flex flex-col">
        {route.map((stop, idx) => (
          <div key={stop.id ?? idx}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-wayfare-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
                {idx + 1}
              </div>
              <div className="font-medium text-slate-800">{stop.name}</div>
            </div>
            {idx < legs.length && (
              <div className="ml-4 pl-[1px] border-l-2 border-dashed border-wayfare-300 my-1 py-2">
                <span className="ml-4 text-xs text-slate-500">
                  ↓ {legs[idx].distanceKm} km
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

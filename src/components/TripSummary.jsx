export default function TripSummary({ result, destinationCount }) {
  const stats = [
    { label: 'Days', value: result.numberOfDays },
    { label: 'Hours / day', value: result.hoursPerDay },
    { label: 'Total available', value: `${result.totalAvailableHours} hrs` },
    { label: 'Destinations', value: destinationCount },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-semibold text-wayfare-700">{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

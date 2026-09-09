export default function Header() {
  return (
    <header className="bg-wayfare-900 text-white py-5 px-6 shadow-sm">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-wayfare-500 flex items-center justify-center font-bold">
          W
        </div>
        <div>
          <div className="font-semibold leading-tight">Wayfare</div>
          <div className="text-xs text-wayfare-100">Trip Feasibility</div>
        </div>
      </div>
    </header>
  );
}

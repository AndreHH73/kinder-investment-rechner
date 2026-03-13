export function CalculatorHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-600 text-sm font-semibold text-white shadow-md shadow-sky-500/40">
          KI
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Kinder-Investment
          </p>
          <p className="text-sm font-medium text-slate-900">
            Zukunftsplaner für dein Kind
          </p>
        </div>
      </div>
      <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
        Modellhafte Simulation – keine Anlageempfehlung
      </div>
    </header>
  );
}


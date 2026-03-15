import { formatCurrency, formatPercent } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";

interface ParameterCardProps {
  value: CalculatorInputs;
  onChange: (value: CalculatorInputs) => void;
}

export function ParameterCard({ value, onChange }: ParameterCardProps) {
  const update = (patch: Partial<CalculatorInputs>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="typo-a1 text-slate-900">
            Anlage-Parameter
          </h2>
          <p className="typo-a2 mt-1 text-slate-500">
            Passe die Werte an, um zu sehen, wie sich das Vermögen verändert.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="typo-a4 flex items-center justify-between font-medium text-slate-600">
            <span>Monatliche Sparrate</span>
            <span className="tabular-nums">
              {formatCurrency(value.monthlyContribution)} / Monat
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={2000}
            step={25}
            value={value.monthlyContribution}
            onChange={(e) =>
              update({ monthlyContribution: Number(e.target.value) })
            }
            className="mt-2 w-full cursor-pointer accent-primary-action"
          />
          <input
            type="number"
            min={0}
            step={25}
            value={value.monthlyContribution}
            onChange={(e) =>
              update({ monthlyContribution: Number(e.target.value) })
            }
            className="typo-a4 mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <div className="typo-a4 flex items-center justify-between font-medium text-slate-600">
            <span>Aktuelles Alter des Kindes</span>
            <span className="tabular-nums">{value.childAge} Jahre</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            step={1}
            value={value.childAge}
            onChange={(e) => update({ childAge: Number(e.target.value) })}
            className="mt-2 w-full cursor-pointer accent-primary-action"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={value.childAge}
            onChange={(e) => update({ childAge: Number(e.target.value) })}
            className="typo-a4 mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <div className="typo-a4 flex items-center justify-between font-medium text-slate-600">
            <span>Zielalter</span>
            <span className="tabular-nums">{value.targetAge} Jahre</span>
          </div>
          <input
            type="range"
            min={value.childAge + 1}
            max={67}
            step={1}
            value={value.targetAge}
            onChange={(e) => update({ targetAge: Number(e.target.value) })}
            className="mt-2 w-full cursor-pointer accent-primary-action"
          />
          <input
            type="number"
            min={value.childAge + 1}
            max={100}
            value={value.targetAge}
            onChange={(e) => update({ targetAge: Number(e.target.value) })}
            className="typo-a4 mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <div className="typo-a4 flex items-center justify-between font-medium text-slate-600">
            <span>Erwartete Rendite p.a.</span>
            <span className="tabular-nums">
              {formatPercent(value.expectedReturnPercentPerYear)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.25}
            value={value.expectedReturnPercentPerYear}
            onChange={(e) =>
              update({ expectedReturnPercentPerYear: Number(e.target.value) })
            }
            className="mt-2 w-full cursor-pointer accent-primary-action"
          />
          <input
            type="number"
            min={-10}
            max={20}
            step={0.1}
            value={value.expectedReturnPercentPerYear}
            onChange={(e) =>
              update({ expectedReturnPercentPerYear: Number(e.target.value) })
            }
            className="typo-a4 mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <div className="typo-a4 flex items-center justify-between font-medium text-slate-600">
            <span>Startkapital (optional)</span>
            <span className="tabular-nums">
              {formatCurrency(value.initialLumpSum)}
            </span>
          </div>
          <input
            type="number"
            min={0}
            step={500}
            value={value.initialLumpSum}
            onChange={(e) => update({ initialLumpSum: Number(e.target.value) })}
            className="typo-a4 mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <p className="typo-a4 text-slate-500">
          Tipp: Kleine Änderungen bei Sparrate, Laufzeit oder Rendite können
          langfristig einen großen Unterschied machen.
        </p>
      </div>
    </section>
  );
}


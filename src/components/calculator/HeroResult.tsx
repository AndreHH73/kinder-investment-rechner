import { formatCurrency, formatPercent } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";
import type { SimulationResult } from "@/types/investment";

interface HeroResultProps {
  inputs: CalculatorInputs;
  simulation: SimulationResult | null;
}

export function HeroResult({ inputs, simulation }: HeroResultProps) {
  const endValue = simulation?.finalBalance ?? 0;
  const totalContributions = simulation?.totalContributions ?? 0;
  const gain = simulation ? simulation.totalInterest : 0;

  const years = inputs.targetAge - inputs.childAge;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 text-slate-100 shadow-xl">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#22c55e_0,_transparent_55%)] opacity-40" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            Projektiertes Vermögen
          </p>
          <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
            Mit{" "}
            <span className="text-sky-300">
              {formatCurrency(inputs.monthlyContribution)}
            </span>{" "}
            monatlich könnte dein Kind mit{" "}
            <span className="text-sky-300">{inputs.targetAge}</span> Jahren
            etwa{" "}
            <span className="text-sky-300">{formatCurrency(endValue)}</span>{" "}
            erreichen.
          </h1>
          <p className="text-sm text-slate-300">
            Das entspricht einem geschätzten Ertrag von{" "}
            <span className="font-semibold text-emerald-300">
              {formatCurrency(gain)}
            </span>{" "}
            bei einer angenommenen Rendite von{" "}
            <span className="font-semibold text-sky-200">
              {formatPercent(inputs.expectedReturnPercentPerYear)}
            </span>{" "}
            über rund <span className="font-semibold">{years} Jahre</span>.
          </p>
        </div>
        <div className="mt-2 flex flex-col items-start gap-2 text-xs text-slate-300 md:items-end">
          <div className="rounded-2xl bg-white/5 px-3 py-2 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Bisher eingezahlt (Projektion)
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">
              {formatCurrency(totalContributions)}
            </p>
          </div>
          <p className="max-w-xs text-[11px] text-slate-400">
            Hinweis: Es handelt sich um eine vereinfachte Hochrechnung auf Basis
            der aktuellen Parameter. Steuern, Kosten und Inflation werden nicht
            berücksichtigt.
          </p>
        </div>
      </div>
    </section>
  );
}


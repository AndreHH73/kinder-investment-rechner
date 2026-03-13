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
    <section
      className="mx-auto max-w-3xl rounded-3xl px-6 py-8 text-slate-100 shadow-xl md:max-w-5xl md:px-10 md:py-10"
      style={{
        background:
          "linear-gradient(135deg, #0F2A44 0%, #1C4E80 60%, #0F2A44 100%)",
      }}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            Prognose zum Zielalter
          </p>
          <h1 className="text-base font-medium text-slate-100 md:text-lg">
            <span className="block">
              Mit{" "}
              <span className="font-semibold">
                {formatCurrency(inputs.monthlyContribution).replace("€", "€")}
              </span>{" "}
              monatlich
            </span>
            <span className="block">könnte dein Kind</span>
          </h1>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-[#2FA36B] md:text-6xl">
            {formatCurrency(endValue)}
          </p>
          <p className="text-sm text-slate-200">
            mit{" "}
            <span className="font-semibold">{inputs.targetAge} Jahren</span>{" "}
            erreichen.
          </p>
          <p className="mt-3 text-[11px] text-slate-200">
            Davon etwa{" "}
            <span className="font-semibold">{formatCurrency(gain)}</span>{" "}
            Zinseszins-Ertrag über{" "}
            <span className="font-semibold">{years} Jahre</span>.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-[11px] text-slate-200 md:justify-end">
          <div>
            <p className="text-xl font-semibold text-slate-50">
              {formatCurrency(totalContributions)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Eingezahlt
            </p>
          </div>
          <div>
            <p className="text-xl font-semibold text-[#2FA36B]">
              {formatCurrency(gain)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Ertrag / Gewinn
            </p>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-50">
              {formatPercent(inputs.expectedReturnPercentPerYear)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Renditeannahme
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


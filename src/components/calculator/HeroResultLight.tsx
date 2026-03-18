"use client";

import { formatCurrency } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";
import type { SimulationResult } from "@/types/investment";

interface HeroResultLightProps {
  inputs: CalculatorInputs;
  simulation: SimulationResult | null;
  hasMilestones?: boolean;
}

export function HeroResultLight({
  inputs,
  simulation,
  hasMilestones = false,
}: HeroResultLightProps) {
  const endValue = simulation?.finalBalance ?? 0;
  const totalContributions = simulation?.totalContributions ?? 0;
  const gain = simulation ? simulation.totalInterest : 0;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-emerald-200/60 bg-white/90 px-5 py-5 shadow-[0_14px_32px_-22px_rgba(2,44,30,0.35)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/60">
          Projiziertes Vermögen
        </p>

        <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          {formatCurrency(endValue)}
        </p>

        <p className="mt-1 text-[12px] font-medium text-slate-500">
          {hasMilestones
            ? "Lebensschritte berücksichtigt"
            : "Lebensschritte noch nicht berücksichtigt"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200/70 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Investiert
            </p>
            <p className="mt-1 text-[13px] font-semibold text-slate-900">
              {formatCurrency(totalContributions)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Zuwachs
            </p>
            <p className="mt-1 text-[13px] font-semibold text-emerald-700">
              {gain >= 0 ? "+" : ""}
              {formatCurrency(gain)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Zielalter
            </p>
            <p className="mt-1 text-[13px] font-semibold text-slate-900">
              {inputs.targetAge} Jahre
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


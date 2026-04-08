"use client";

import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";
import type { SimulationResult } from "@/types/investment";

interface HeroResultLightProps {
  inputs: CalculatorInputs;
  simulation: SimulationResult | null;
  hasMilestones?: boolean;
  /** Äußerer Wrapper (z. B. volle Breite auf Desktop-Planseite) */
  containerClassName?: string;
  valueClassName?: string;
  cardClassName?: string;
  titleClassName?: string;
  noteClassName?: string;
  statsLabelClassName?: string;
  statsValueClassName?: string;
  statsGridClassName?: string;
  centered?: boolean;
  contentGapClassName?: string;
  footer?: ReactNode;
}

export function HeroResultLight({
  inputs,
  simulation,
  hasMilestones = false,
  containerClassName,
  valueClassName = "text-4xl",
  cardClassName = "",
  titleClassName = "text-[11px]",
  noteClassName = "text-[12px]",
  statsLabelClassName = "text-[10px]",
  statsValueClassName = "text-[13px]",
  statsGridClassName = "",
  centered = false,
  contentGapClassName = "",
  footer,
}: HeroResultLightProps) {
  const endValue = simulation?.finalBalance ?? 0;
  const totalContributions = simulation?.totalContributions ?? 0;
  const gain = simulation
    ? simulation.finalBalance - simulation.totalContributions
    : 0;

  return (
    <section
      className={
        containerClassName ?? "mx-auto w-full max-w-3xl"
      }
    >
      <div
        className={`overflow-hidden rounded-3xl border border-emerald-200/60 bg-white/90 px-5 py-5 shadow-[0_14px_32px_-22px_rgba(2,44,30,0.35)] backdrop-blur ${cardClassName}`}
      >
        <div className={contentGapClassName}>
        <p
          className={`${titleClassName} font-semibold uppercase tracking-[0.18em] text-emerald-800/60 ${centered ? "text-center" : ""}`}
        >
          Projiziertes Vermögen
        </p>

        <p
          className={`mt-2 font-semibold tracking-tight text-slate-900 ${valueClassName} ${centered ? "text-center" : ""}`}
        >
          {formatCurrency(endValue)}
        </p>

        <p
          className={`mt-1 font-medium text-slate-500 ${noteClassName} ${centered ? "text-center" : ""}`}
        >
          {hasMilestones
            ? "Lebensschritte berücksichtigt"
            : "Lebensschritte noch nicht berücksichtigt"}
        </p>

        <div
          className={`mt-4 grid grid-cols-3 gap-3 border-t border-slate-200/70 pt-4 ${statsGridClassName}`}
        >
          <div>
            <p
              className={`${statsLabelClassName} font-semibold uppercase tracking-[0.18em] text-slate-500 ${centered ? "text-center" : ""}`}
            >
              Investiert
            </p>
            <p
              className={`mt-1 font-semibold text-slate-900 ${statsValueClassName} ${centered ? "text-center" : ""}`}
            >
              {formatCurrency(totalContributions)}
            </p>
          </div>

          <div className={centered ? "text-center" : "text-center"}>
            <p
              className={`${statsLabelClassName} font-semibold uppercase tracking-[0.18em] text-slate-500`}
            >
              Zuwachs
            </p>
            <p className={`mt-1 font-semibold text-emerald-700 ${statsValueClassName}`}>
              {gain >= 0 ? "+" : ""}
              {formatCurrency(gain)}
            </p>
          </div>

          <div className={centered ? "text-center" : "text-right"}>
            <p
              className={`${statsLabelClassName} font-semibold uppercase tracking-[0.18em] text-slate-500`}
            >
              Zielalter
            </p>
            <p className={`mt-1 font-semibold text-slate-900 ${statsValueClassName}`}>
              {inputs.targetAge} Jahre
            </p>
          </div>
        </div>
        {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}


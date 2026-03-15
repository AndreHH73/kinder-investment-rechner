"use client";

import { useEffect, useRef, useState } from "react";

import { formatCurrency, formatCurrencyWithSign } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";
import type { SimulationResult } from "@/types/investment";

const ANIMATION_DURATION_MS = 400;

interface HeroResultProps {
  inputs: CalculatorInputs;
  simulation: SimulationResult | null;
  baselineScenario?: { monthly: number; endValue: number } | null;
  hasMilestones?: boolean;
}

export function HeroResult({
  inputs,
  simulation,
  baselineScenario = null,
  hasMilestones = false,
}: HeroResultProps) {
  const endValue = simulation?.finalBalance ?? 0;
  const totalContributions = simulation?.totalContributions ?? 0;
  const gain = simulation ? simulation.totalInterest : 0;

  const [displayValue, setDisplayValue] = useState(endValue);
  const [heroPulse, setHeroPulse] = useState(false);
  const previousEndValueRef = useRef(endValue);

  const showDelta =
    baselineScenario != null &&
    inputs.monthlyContribution !== baselineScenario.monthly;
  const delta = showDelta ? endValue - baselineScenario.endValue : 0;

  useEffect(() => {
    if (baselineScenario == null) {
      setDisplayValue(endValue);
      previousEndValueRef.current = endValue;
      return;
    }
    if (endValue === previousEndValueRef.current) return;
    const startValue = previousEndValueRef.current;
    previousEndValueRef.current = endValue;
    setHeroPulse(true);
    const t0 = performance.now();
    const step = (t: number) => {
      const elapsed = t - t0;
      if (elapsed >= ANIMATION_DURATION_MS) {
        setDisplayValue(endValue);
        return;
      }
      const progress = elapsed / ANIMATION_DURATION_MS;
      const eased = 1 - (1 - progress) ** 2;
      setDisplayValue(Math.round(startValue + (endValue - startValue) * eased));
      requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [endValue, baselineScenario]);

  useEffect(() => {
    if (!heroPulse) return;
    const t = setTimeout(() => setHeroPulse(false), 300);
    return () => clearTimeout(t);
  }, [heroPulse]);

  return (
    <section
      className={`mx-auto max-w-3xl overflow-hidden rounded-3xl px-5 py-6 text-slate-100 shadow-xl transition-transform duration-200 md:max-w-5xl md:px-6 md:py-7 ${
        heroPulse ? "scale-[1.01]" : "scale-100"
      }`}
      style={{
        background:
          "linear-gradient(180deg, #1a3a5c 0%, #0F2A44 40%, #0a1f33 100%)",
      }}
    >
      {/* Einleitungszeile */}
      <p className="text-[15px] font-normal leading-snug text-slate-100">
        Mit{" "}
        <span className="font-bold">
          {formatCurrency(inputs.monthlyContribution).replace("€", "€")}
        </span>{" "}
        € monatlich ermöglichst du deinem Kind,
      </p>

      {/* Große Vermögenszahl + optional Delta */}
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className="text-4xl font-bold tracking-tight text-[#2FA36B] md:text-5xl">
          {formatCurrency(displayValue)}*
        </p>
        {delta !== 0 && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              delta > 0
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {delta > 0 ? (
              <>
                <span aria-hidden>↑</span>
                {formatCurrencyWithSign(delta)}
              </>
            ) : (
              <>
                <span aria-hidden>↓</span>
                {formatCurrencyWithSign(delta)}
              </>
            )}
          </span>
        )}
      </div>

      {/* Zusatzzeile darunter (teal) */}
      <p className="mt-1 text-[13px] font-normal text-[#2FA36B]">
        {hasMilestones
          ? "(inkl. Finanzierung aller Lebensschritte)"
          : "(ohne geplante Lebensschritte)"}
      </p>

      {/* Delta-Erläuterung nur wenn aktiv */}
      {showDelta && delta !== 0 && (
        <p
          className={`mt-1.5 text-[12px] ${
            delta > 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {delta > 0 ? (
            <>
              {formatCurrencyWithSign(delta)} mehr als bei{" "}
              {formatCurrency(baselineScenario.monthly).replace("€", "€")}{" "}
              monatlich
            </>
          ) : (
            <>
              {formatCurrencyWithSign(delta)} weniger als bei{" "}
              {formatCurrency(baselineScenario.monthly).replace("€", "€")}{" "}
              monatlich
            </>
          )}
        </p>
      )}

      {/* Trennlinie */}
      <hr className="mt-5 border-0 border-t border-slate-500/50 md:mt-6" />

      {/* Kennzahlen: Eingezahlt | Ertrag / Gewinn */}
      <div className="mt-5 flex flex-row justify-between gap-4 md:mt-6">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
            Eingezahlt
          </p>
          <p className="mt-0.5 text-lg font-semibold text-slate-50">
            {formatCurrency(totalContributions)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
            Ertrag / Gewinn
          </p>
          <p className="mt-0.5 text-lg font-semibold text-[#2FA36B]">
            {formatCurrency(gain)}
          </p>
        </div>
      </div>

      {/* Abschlusszeile */}
      <p className="mt-4 text-[13px] font-normal text-slate-300">
        mit{" "}
        <span className="font-semibold text-slate-100">
          {inputs.targetAge} Jahren
        </span>{" "}
        aufzubauen.
      </p>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

import { formatCurrency, formatCurrencyWithSign, formatPercent } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";
import type { SimulationResult } from "@/types/investment";

const ANIMATION_DURATION_MS = 400;

interface HeroResultProps {
  inputs: CalculatorInputs;
  simulation: SimulationResult | null;
  baselineScenario?: { monthly: number; endValue: number } | null;
}

export function HeroResult({
  inputs,
  simulation,
  baselineScenario = null,
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
      className={`mx-auto max-w-3xl rounded-3xl px-6 py-8 text-slate-100 shadow-xl transition-transform duration-200 md:max-w-5xl md:px-10 md:py-10 ${
        heroPulse ? "scale-[1.01]" : "scale-100"
      }`}
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
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <p className="text-5xl font-semibold tracking-tight text-[#2FA36B] md:text-6xl">
              {formatCurrency(displayValue)}
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
          {showDelta && delta !== 0 && (
            <p
              className={`text-sm font-semibold ${
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
          <p className="text-sm text-slate-200">
            mit{" "}
            <span className="font-semibold">{inputs.targetAge} Jahren</span>{" "}
            erreichen.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-6 text-[11px] text-slate-200 md:justify-end">
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


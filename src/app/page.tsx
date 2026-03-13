/* eslint-disable import/no-extraneous-dependencies */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CalculatorHeader } from "@/components/calculator/Header";
import { GrowthChart } from "@/components/calculator/GrowthChart";
import { HeroResult } from "@/components/calculator/HeroResult";
import { MilestoneForm } from "@/components/calculator/MilestoneForm";
import {
  MilestonesSection,
  type MilestoneTemplate,
} from "@/components/calculator/MilestonesSection";
import { MobileInputStep } from "@/components/calculator/MobileInputStep";
import { MobileResultStep } from "@/components/calculator/MobileResultStep";
import { ParameterCard } from "@/components/calculator/ParameterCard";
import { SavePlanModal } from "@/components/calculator/SavePlanModal";
import { SummaryCards } from "@/components/calculator/SummaryCards";
import { defaultInputs } from "@/data/defaultMilestones";
import {
  getRecommendedMonthlyRate,
  runCalculatorSimulation,
} from "@/lib/simulation";
import type {
  ChartMilestone,
  CalculatorInputs,
  CalculatorSimulationResult,
  Milestone,
} from "@/types/calculator";

export default function HomePage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [milestoneMode, setMilestoneMode] = useState<"create" | "edit">(
    "create",
  );
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [comparisonRange, setComparisonRange] = useState<number>(50);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [baselineScenario, setBaselineScenario] = useState<{
    monthly: number;
    endValue: number;
  } | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const {
    simulation,
    chartPoints,
    chartMilestones,
  }: {
    simulation: CalculatorSimulationResult | null;
    chartPoints: import("@/types/calculator").SimulationPoint[];
    chartMilestones: ChartMilestone[];
  } = useMemo(() => {
    const base = runCalculatorSimulation(inputs, milestones);
    const basePoints = base.points;

    // Baue Punkte mit sichtbaren "Drops" bei kostenpflichtigen Meilensteinen
    let chartPoints: import("@/types/calculator").SimulationPoint[] = [];
    if (basePoints.length > 0) {
      const expenseMilestones = milestones
        .filter((m) => m.amount < 0)
        .sort((a, b) => a.age - b.age);

      const remainingIds = new Set(expenseMilestones.map((m) => m.id));
      const getDetail = (id: string) => base.milestoneDetails.get(id);

      for (let i = 0; i < basePoints.length - 1; i += 1) {
        const current = basePoints[i];
        const next = basePoints[i + 1];
        chartPoints.push(current);

        const segmentMilestones = expenseMilestones.filter(
          (m) =>
            remainingIds.has(m.id) &&
            m.age >= current.age &&
            m.age <= next.age,
        );

        for (const m of segmentMilestones) {
          remainingIds.delete(m.id);
          const detail = getDetail(m.id);
          if (!detail) continue;

          const beforePoint: import("@/types/calculator").SimulationPoint = {
            age: m.age,
            portfolioValue: detail.balanceAtAge,
            contributionsValue: current.contributionsValue,
          };

          const afterPoint: import("@/types/calculator").SimulationPoint = {
            age: m.age,
            portfolioValue: detail.balanceAfter,
            contributionsValue: current.contributionsValue,
          };

          chartPoints.push(beforePoint, afterPoint);
        }
      }

      chartPoints.push(basePoints[basePoints.length - 1]);
    }

    const chartMilestones: ChartMilestone[] = milestones.map((m) => {
      const detail = base.milestoneDetails.get(m.id);
      const yearPoint = base.core.years.find(
        (y) => Math.round(y.age) === Math.round(m.age),
      );
      const portfolioValue =
        detail?.balanceAtAge ?? yearPoint?.endingBalance ?? 0;
      return {
        id: m.id,
        age: m.age,
        title: m.title,
        type: m.type,
        status: detail?.status ?? null,
        portfolioValue,
        balanceAtAge: detail?.balanceAtAge ?? yearPoint?.startingBalance ?? 0,
        balanceAfter: detail?.balanceAfter ?? yearPoint?.endingBalance ?? 0,
        cost: detail?.cost ?? 0,
      };
    });

    return {
      simulation: base,
      chartPoints,
      chartMilestones,
    };
  }, [inputs, milestones, comparisonRange]);

  const recommendation = useMemo(() => {
    if (!simulation?.milestoneDetails || milestones.length === 0) return null;
    const expenseMilestones = milestones.filter((m) => m.amount < 0);
    if (expenseMilestones.length === 0) return null;
    const allFundable = expenseMilestones.every(
      (m) => simulation.milestoneDetails.get(m.id)?.status === "finanzierbar",
    );
    if (allFundable) return null;
    const recommended = getRecommendedMonthlyRate(inputs, milestones);
    if (recommended == null) return null;
    return {
      recommendedMonthly: recommended,
      deltaFromCurrent: recommended - inputs.monthlyContribution,
    };
  }, [simulation, inputs, milestones]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [inputs, milestones]);

  useEffect(() => {
    if (mobileStep !== 2) return;
    const el = heroRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [mobileStep]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <CalculatorHeader />
        <div ref={heroRef}>
          <HeroResult
            inputs={inputs}
            simulation={simulation?.core ?? null}
            baselineScenario={
              mobileStep === 2 ? baselineScenario : null
            }
            hasMilestones={milestones.length > 0}
          />
        </div>

        {/* Mobile Flow */}
        <div className="space-y-4 lg:hidden">
          {mobileStep === 1 && (
            <MobileInputStep
              value={inputs}
              onChange={setInputs}
              onNext={() => {
                setBaselineScenario({
                  monthly: inputs.monthlyContribution,
                  endValue: simulation?.core?.finalBalance ?? 0,
                });
                setMobileStep(2);
              }}
            />
          )}
          {mobileStep === 2 && (
            <MobileResultStep
              simulation={simulation}
              points={chartPoints}
              chartMilestones={chartMilestones}
              comparisonRange={comparisonRange}
              onRangeChange={setComparisonRange}
              baseMonthly={inputs.monthlyContribution}
              milestones={milestones}
              onAddMilestone={() => {
                const nextAge =
                  (milestones[milestones.length - 1]?.age ??
                    inputs.childAge + 1) as number;
                setMilestoneMode("create");
                setEditingMilestone({
                  id: `m-${Date.now()}`,
                  title: "",
                  age: nextAge,
                  amount: 0,
                  type: "expense",
                  description: "",
                });
              }}
              onEditMilestone={(milestone) => {
                setMilestoneMode("edit");
                setEditingMilestone(milestone);
              }}
              onDeleteMilestone={(id) => {
                setMilestones((prev) => prev.filter((m) => m.id !== id));
              }}
              recommendation={recommendation}
              onApplyRecommended={(amount) =>
                setInputs((prev) => ({ ...prev, monthlyContribution: amount }))
              }
              onAddFromTemplate={(template: MilestoneTemplate) => {
                setMilestoneMode("create");
                setEditingMilestone({
                  id: `m-${Date.now()}`,
                  title: template.title,
                  age: template.defaultAge,
                  amount: template.defaultAmount,
                  type: "expense",
                  description: `Typische Kosten: ${template.costLabel}`,
                });
              }}
              onBack={() => setMobileStep(1)}
              onSelectScenarioAmount={(amount) =>
                setInputs((prev) => ({ ...prev, monthlyContribution: amount }))
              }
            />
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden flex-col gap-6 lg:flex">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
            <ParameterCard value={inputs} onChange={setInputs} />
            <GrowthChart
              points={chartPoints}
              milestones={chartMilestones}
            />
          </section>

          <div className="space-y-3">
            <SummaryCards result={simulation} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSaveModalOpen(true)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 shadow-sm hover:bg-slate-800"
              >
                Plan speichern
              </button>
            </div>
          </div>

          <MilestonesSection
            milestones={milestones}
            milestoneDetails={simulation?.milestoneDetails}
            recommendation={recommendation}
            onApplyRecommended={(amount) =>
              setInputs((prev) => ({ ...prev, monthlyContribution: amount }))
            }
            finalBalance={simulation?.core?.finalBalance ?? 0}
            onAdd={() => {
              const nextAge =
                (milestones[milestones.length - 1]?.age ??
                  inputs.childAge + 1) as number;
              setMilestoneMode("create");
              setEditingMilestone({
                id: `m-${Date.now()}`,
                title: "",
                age: nextAge,
                amount: 0,
                type: "expense",
                description: "",
              });
            }}
            onAddFromTemplate={(template: MilestoneTemplate) => {
              setMilestoneMode("create");
              setEditingMilestone({
                id: `m-${Date.now()}`,
                title: template.title,
                age: template.defaultAge,
                amount: template.defaultAmount,
                type: "expense",
                description: `Typische Kosten: ${template.costLabel}`,
              });
            }}
            onEdit={(milestone) => {
              setMilestoneMode("edit");
              setEditingMilestone(milestone);
            }}
            onDelete={(id) => {
              setMilestones((prev) => prev.filter((m) => m.id !== id));
            }}
          />
        </div>

        <footer className="mt-4 border-t border-slate-200 pt-4 text-[11px] text-slate-500">
          <p className="max-w-4xl">
            Hinweis / Disclaimer: Diese Berechnungen sind modellhaft und dienen
            ausschließlich der Veranschaulichung möglicher Wertentwicklungen.
            Renditen sind nicht garantiert, tatsächliche Wertverläufe können von
            den Annahmen abweichen. Steuern, Kosten und individuelle
            Vertragsbedingungen werden nicht berücksichtigt. Die Ergebnisse
            stellen keine Finanz-, Anlage-, Steuer- oder Rechtsberatung dar und
            können eine persönliche Beratung nicht ersetzen.
          </p>
        </footer>
      </main>
      <MilestoneForm
        initial={editingMilestone}
        mode={milestoneMode}
        onSubmit={(milestone) => {
          setMilestones((prev) => {
            if (milestoneMode === "create") {
              return [...prev, milestone];
            }
            return prev.map((m) => (m.id === milestone.id ? milestone : m));
          });
          setEditingMilestone(null);
        }}
        onDelete={(id) => {
          setMilestones((prev) => prev.filter((m) => m.id !== id));
          setEditingMilestone(null);
        }}
        onClose={() => setEditingMilestone(null)}
      />
      <SavePlanModal
        open={saveModalOpen}
        inputs={inputs}
        milestones={milestones}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
}



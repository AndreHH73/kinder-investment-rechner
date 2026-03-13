/* eslint-disable import/no-extraneous-dependencies */
"use client";

import { useMemo, useState } from "react";

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
import { runCalculatorSimulation } from "@/lib/simulation";
import type {
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
  const [compareScenarios, setCompareScenarios] = useState(false);
  const [comparisonRange, setComparisonRange] = useState<number>(50);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [baselineScenario, setBaselineScenario] = useState<{
    monthly: number;
    endValue: number;
  } | null>(null);

  const {
    simulation,
    chartPoints,
    ahaDifference,
    lowerMonthly,
    higherMonthly,
  }: {
    simulation: CalculatorSimulationResult | null;
    chartPoints: import("@/types/calculator").SimulationPoint[];
    ahaDifference: number;
    lowerMonthly: number;
    higherMonthly: number;
  } = useMemo(() => {
    const base = runCalculatorSimulation(inputs, milestones);
    const delta = comparisonRange;

    const lowerInputs: CalculatorInputs = {
      ...inputs,
      monthlyContribution: Math.max(0, inputs.monthlyContribution - delta),
    };
    const higherInputs: CalculatorInputs = {
      ...inputs,
      monthlyContribution: inputs.monthlyContribution + delta,
    };

    const lower = runCalculatorSimulation(lowerInputs, milestones);
    const higher = runCalculatorSimulation(higherInputs, milestones);

    const chartPoints = compareScenarios
      ? base.points.map((point, index) => ({
          ...point,
          lowerPortfolioValue:
            lower.points[index]?.portfolioValue ?? point.portfolioValue,
          higherPortfolioValue:
            higher.points[index]?.portfolioValue ?? point.portfolioValue,
          lowerContributionsValue:
            lower.points[index]?.contributionsValue ?? point.contributionsValue,
          higherContributionsValue:
            higher.points[index]?.contributionsValue ?? point.contributionsValue,
        }))
      : base.points;

    return {
      simulation: base,
      chartPoints,
      ahaDifference: Math.max(
        0,
        higher.core.finalBalance - base.core.finalBalance,
      ),
      lowerMonthly: lowerInputs.monthlyContribution,
      higherMonthly: higherInputs.monthlyContribution,
    };
  }, [inputs, milestones, compareScenarios, comparisonRange]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <CalculatorHeader />
        <HeroResult
          inputs={inputs}
          simulation={simulation?.core ?? null}
          baselineScenario={
            mobileStep === 2 ? baselineScenario : null
          }
        />

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
              compareEnabled={compareScenarios}
              onToggleCompare={setCompareScenarios}
              comparisonRange={comparisonRange}
              onRangeChange={setComparisonRange}
              baseMonthly={inputs.monthlyContribution}
              lowerMonthly={lowerMonthly}
              higherMonthly={higherMonthly}
              ahaDifference={ahaDifference}
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
              compareEnabled={compareScenarios}
              onToggleCompare={setCompareScenarios}
              comparisonRange={comparisonRange}
              onRangeChange={setComparisonRange}
              baseMonthly={inputs.monthlyContribution}
              lowerMonthly={lowerMonthly}
              higherMonthly={higherMonthly}
              ahaDifference={ahaDifference}
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



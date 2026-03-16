import { GrowthChart } from "@/components/calculator/GrowthChart";
import { ChildLifeTimeline } from "@/components/calculator/ChildLifeTimeline";
import {
  MilestonesSection,
  type MilestoneTemplate,
  type SavingsRecommendation,
} from "@/components/calculator/MilestonesSection";
import { formatCurrency } from "@/lib/format";
import type {
  ChartMilestone,
  CalculatorSimulationResult,
  Milestone,
  SimulationPoint,
} from "@/types/calculator";

interface MobileResultStepProps {
  simulation: CalculatorSimulationResult | null;
  points: SimulationPoint[];
  chartMilestones: ChartMilestone[];
  comparisonRange: number;
  onRangeChange: (range: number) => void;
  baseMonthly: number;
  milestones: Milestone[];
  recommendation?: SavingsRecommendation | null;
  onApplyRecommended?: (amount: number) => void;
  onAddMilestone: () => void;
  onAddFromTemplate?: (template: MilestoneTemplate) => void;
  onEditMilestone: (m: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
  onBack: () => void;
  onSelectScenarioAmount: (amount: number) => void;
}

export function MobileResultStep({
  simulation,
  points,
  chartMilestones,
  comparisonRange,
  onRangeChange,
  baseMonthly,
  milestones,
  recommendation = null,
  onApplyRecommended,
  onAddMilestone,
  onAddFromTemplate,
  onEditMilestone,
  onDeleteMilestone,
  onBack,
  onSelectScenarioAmount,
}: MobileResultStepProps) {

  const delta = comparisonRange;
  const rawScenarios = [
    Math.max(0, baseMonthly - delta),
    baseMonthly,
    baseMonthly + delta,
  ];
  const scenarios = Array.from(new Set(rawScenarios))
    .filter((v) => v >= 0)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <MilestonesSection
        milestones={milestones}
        milestoneDetails={simulation?.milestoneDetails}
        recommendation={recommendation}
        onApplyRecommended={onApplyRecommended}
        finalBalance={simulation?.core?.finalBalance ?? 0}
        onAdd={onAddMilestone}
        onAddFromTemplate={onAddFromTemplate}
        onEdit={onEditMilestone}
        onDelete={onDeleteMilestone}
        slotBetweenSelectionAndFinancing={
          <ChildLifeTimeline milestones={milestones} simulation={simulation} />
        }
      />

      <section className="rounded-3xl bg-surface p-6 shadow-sm shadow-slate-200/80">
        <h2 className="typo-a1 text-slate-800">
          Sparrate anpassen
        </h2>
        <p className="typo-a2 mt-1 text-slate-600">
          Teste, wie sich eine höhere oder niedrigere Sparrate auf den Lebensweg deines Kindes auswirkt.
        </p>

        <div className="mt-4">
          <p className="typo-a3 text-slate-500">
            Vergleichsbereich
          </p>
          <div className="typo-a4 mt-2 flex flex-wrap gap-2">
            {[25, 50, 100].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onRangeChange(value)}
                className={`rounded-full px-3 py-1.5 font-medium ${
                  comparisonRange === value
                    ? "bg-primary-action text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                +{value} €
              </button>
            ))}
          </div>
          <div className="typo-a4 mt-3 space-y-2">
            {scenarios.map((amount, index) => {
              const isCurrent = amount === baseMonthly;
              return (
                <button
                  key={`scenario-${amount}-${index}`}
                  type="button"
                  onClick={() => onSelectScenarioAmount(amount)}
                  className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 transition-colors ${
                    isCurrent
                      ? "border-primary-action bg-primary-action/10 text-slate-900"
                      : "border-transparent bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatCurrency(amount).replace("€", "€ / Monat")}
                  {isCurrent && (
                    <span className="typo-a4 rounded-full bg-primary-action/15 px-2 py-0.5 font-medium text-primary-action">
                      aktuell
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <GrowthChart
        points={points}
        milestones={chartMilestones}
      />
    </div>
  );
}


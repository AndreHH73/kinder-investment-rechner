import { GrowthChart } from "@/components/calculator/GrowthChart";
import {
  MilestonesSection,
  type MilestoneTemplate,
} from "@/components/calculator/MilestonesSection";
import { formatCurrency } from "@/lib/format";
import type {
  CalculatorSimulationResult,
  Milestone,
  SimulationPoint,
} from "@/types/calculator";

interface MobileResultStepProps {
  simulation: CalculatorSimulationResult | null;
  points: SimulationPoint[];
  compareEnabled: boolean;
  onToggleCompare: (enabled: boolean) => void;
  comparisonRange: number;
  onRangeChange: (range: number) => void;
  baseMonthly: number;
  lowerMonthly: number;
  higherMonthly: number;
  ahaDifference: number;
  milestones: Milestone[];
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
  compareEnabled,
  onToggleCompare,
  comparisonRange,
  onRangeChange,
  baseMonthly,
  lowerMonthly,
  higherMonthly,
  ahaDifference,
  milestones,
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
    <div className="space-y-4">
      <section className="rounded-3xl bg-surface p-5 shadow-sm shadow-primary/5">
        <p className="text-sm text-slate-600">
          So verändert mehr Sparen das Ergebnis
        </p>

        <div className="mt-4">
          <p className="text-[11px] font-medium text-slate-600">
            Szenarien (Sparrate pro Monat)
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            {[25, 50, 100].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onRangeChange(value)}
                className={`rounded-full px-3 py-1.5 ${
                  comparisonRange === value
                    ? "bg-slate-900 text-slate-50"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                +{value} €
              </button>
            ))}
          </div>
          <div className="mt-2 space-y-2 text-[11px]">
            {scenarios.map((amount, index) => {
              const isCurrent = amount === baseMonthly;
              return (
                <button
                  key={`scenario-${amount}-${index}`}
                  type="button"
                  onClick={() => onSelectScenarioAmount(amount)}
                  className={`flex min-h-[44px] w-full items-center justify-center rounded-xl px-3 py-2 ${
                    isCurrent
                      ? "bg-slate-900 text-slate-50"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatCurrency(amount).replace("€", "€ / Monat")}
                  {isCurrent && " (aktuell)"}
                </button>
              );
            })}
          </div>
        </div>

      </section>

      <MilestonesSection
        milestones={milestones}
        milestoneDetails={simulation?.milestoneDetails}
        finalBalance={simulation?.core?.finalBalance ?? 0}
        onAdd={onAddMilestone}
        onAddFromTemplate={onAddFromTemplate}
        onEdit={onEditMilestone}
        onDelete={onDeleteMilestone}
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-muted bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm"
        >
          Eckdaten anpassen
        </button>
      </div>

      <GrowthChart
        points={points}
        compareEnabled={compareEnabled}
        onToggleCompare={onToggleCompare}
        comparisonRange={comparisonRange}
        onRangeChange={onRangeChange}
        baseMonthly={baseMonthly}
        lowerMonthly={lowerMonthly}
        higherMonthly={higherMonthly}
        ahaDifference={ahaDifference}
      />
    </div>
  );
}


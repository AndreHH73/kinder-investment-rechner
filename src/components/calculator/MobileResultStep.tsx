import { GrowthChart } from "@/components/calculator/GrowthChart";
import { MilestonesSection } from "@/components/calculator/MilestonesSection";
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
  onEditMilestone,
  onDeleteMilestone,
  onBack,
  onSelectScenarioAmount,
}: MobileResultStepProps) {
  const core = simulation?.core ?? null;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-surface p-5 shadow-sm shadow-primary/5">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-muted px-3 py-1 font-medium text-foreground"
          >
            Zurück zu den Eckdaten
          </button>
        </div>
        {core && (
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Ergebnis zum Zielalter
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(core.finalBalance)}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-600">
              <div>
                <p>Eingezahlt</p>
                <p className="font-semibold text-emerald-700">
                  {formatCurrency(core.totalContributions)}
                </p>
              </div>
              <div>
                <p>Ertrag / Gewinn</p>
                <p className="font-semibold">{formatCurrency(core.totalInterest)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-medium text-slate-600">
            Szenarien (Sparrate pro Monat)
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            {[lowerMonthly, baseMonthly, higherMonthly].map(
              (amount, index) => {
                const isCurrent = amount === baseMonthly;
                return (
                  <button
                    key={`${amount}-${index}`}
                    type="button"
                    onClick={() => onSelectScenarioAmount(amount)}
                    className={`rounded-full px-3 py-1 ${
                      isCurrent
                        ? "bg-slate-900 text-slate-50"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatCurrency(amount).replace("€", "€ / Monat")}
                    {isCurrent && " (aktuell)"}
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      <MilestonesSection
        milestones={milestones}
        onAdd={onAddMilestone}
        onEdit={onEditMilestone}
        onDelete={onDeleteMilestone}
      />

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


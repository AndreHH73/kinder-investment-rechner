import { formatCurrency } from "@/lib/format";
import type { CalculatorSimulationResult } from "@/types/calculator";

interface SummaryCardsProps {
  result: CalculatorSimulationResult | null;
}

export function SummaryCards({ result }: SummaryCardsProps) {
  if (!result) return null;

  const { core, totalMilestoneIncome, totalMilestoneExpenses } = result;

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl bg-surface p-4 shadow-sm shadow-primary/5">
        <p className="typo-a3 text-slate-500">
          Insgesamt eingezahlt
        </p>
        <p className="typo-a4-medium mt-2 text-lg text-secondary">
          {formatCurrency(core.totalContributions)}
        </p>
        <p className="typo-a4 mt-1 text-slate-500">
          Summe aller regelmäßigen Einzahlungen und Einmalanlagen.
        </p>
      </div>
      <div className="rounded-2xl bg-surface p-4 shadow-sm shadow-primary/5">
        <p className="typo-a3 text-slate-500">
          Geschätzter Gewinn
        </p>
        <p className="typo-a4-medium mt-2 text-lg text-foreground">
          {formatCurrency(core.totalInterest)}
        </p>
        <p className="typo-a4 mt-1 text-slate-500">
          Ertrag aus Zinseszins vor Steuern und Kosten.
        </p>
      </div>
      <div className="rounded-2xl bg-surface p-4 shadow-sm shadow-primary/5">
        <p className="typo-a3 text-slate-500">
          Endvermögen
        </p>
        <p className="typo-a4-medium mt-2 text-lg text-gold">
          {formatCurrency(core.finalBalance)}
        </p>
        <p className="typo-a4 mt-1 text-slate-500">
          Nach Berücksichtigung aller Lebensschritte, Einzahlungen und Entnahmen.
        </p>
        <div className="typo-a4 mt-2 flex justify-between text-slate-500">
          <span>Lebensschritt-Zuflüsse: {formatCurrency(totalMilestoneIncome)}</span>
          <span>Lebensschritt-Abflüsse: {formatCurrency(totalMilestoneExpenses)}</span>
        </div>
      </div>
    </section>
  );
}


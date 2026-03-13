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
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Insgesamt eingezahlt
        </p>
        <p className="mt-2 text-xl font-semibold text-secondary">
          {formatCurrency(core.totalContributions)}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Summe aller regelmäßigen Einzahlungen und Einmalanlagen.
        </p>
      </div>
      <div className="rounded-2xl bg-surface p-4 shadow-sm shadow-primary/5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Geschätzter Gewinn
        </p>
        <p className="mt-2 text-xl font-semibold text-foreground">
          {formatCurrency(core.totalInterest)}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Ertrag aus Zinseszins vor Steuern und Kosten.
        </p>
      </div>
      <div className="rounded-2xl bg-surface p-4 shadow-sm shadow-primary/5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Endvermögen
        </p>
        <p className="mt-2 text-xl font-semibold text-gold">
          {formatCurrency(core.finalBalance)}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Nach Berücksichtigung aller Meilensteine, Einzahlungen und Entnahmen.
        </p>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          <span>Ereignis-Zuflüsse: {formatCurrency(totalMilestoneIncome)}</span>
          <span>Ereignis-Abflüsse: {formatCurrency(totalMilestoneExpenses)}</span>
        </div>
      </div>
    </section>
  );
}


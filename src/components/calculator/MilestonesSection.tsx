import { formatCurrency, formatCurrencyWithSign } from "@/lib/format";
import type { Milestone } from "@/types/calculator";

interface MilestonesSectionProps {
  milestones: Milestone[];
  onAdd: () => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export function MilestonesSection({
  milestones,
  onAdd,
  onEdit,
  onDelete,
}: MilestonesSectionProps) {
  const sorted = [...milestones].sort((a, b) => a.age - b.age);

  const totalIncome = milestones
    .filter((m) => m.amount > 0)
    .reduce((sum, m) => sum + m.amount, 0);
  const totalExpenses = milestones
    .filter((m) => m.amount < 0)
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-900/5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Finanzielle Meilensteine
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Plane wichtige Lebensereignisse deines Kindes und sieh direkt, wie
            sie den Vermögensverlauf beeinflussen.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-700"
        >
          Meilenstein hinzufügen
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {sorted.map((m) => {
          const isIncome = m.amount > 0;
          const pillColor = isIncome
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700";

          return (
            <article
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {m.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {m.age} Jahre
                  </p>
                  {m.description && (
                    <p className="mt-1 text-[11px] text-slate-600">
                      {m.description}
                    </p>
                  )}
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-[11px] font-medium ${pillColor}`}
                >
                  {isIncome ? "Einnahme" : "Ausgabe"}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <p className="font-semibold text-slate-900">
                  {formatCurrencyWithSign(m.amount)}
                </p>
                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(m)}
                      className="text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(m.id)}
                      className="text-[11px] text-slate-500 hover:text-rose-600"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-xs text-slate-500">
            Noch keine Meilensteine definiert. Füge über den Button oben dein
            erstes Ereignis hinzu.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-[11px] text-slate-100">
        <div>
          <p className="font-medium uppercase tracking-[0.16em] text-slate-400">
            Zusammenfassung Meilensteine
          </p>
          <p className="mt-1 text-xs text-slate-200">
            Nettowirkung deiner definierten Ereignisse auf das Portfolio.
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-slate-400">Gesamte erwartete Zuflüsse</p>
            <p className="mt-1 font-semibold text-emerald-300">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Gesamte erwartete Ausgaben</p>
            <p className="mt-1 font-semibold text-rose-300">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Netto-Effekt</p>
            <p className="mt-1 font-semibold">
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


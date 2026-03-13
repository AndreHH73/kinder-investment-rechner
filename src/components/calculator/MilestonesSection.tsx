import { formatCurrency, formatCurrencyWithSign } from "@/lib/format";
import type { Milestone, MilestoneDetail } from "@/types/calculator";

export interface MilestoneTemplate {
  id: string;
  icon: string;
  title: string;
  costLabel: string;
  typicalCostLabel: string;
  costMin: number;
  costMax: number;
  defaultAge: number;
  defaultAmount: number;
}

const LIFEEVENT_TEMPLATES: MilestoneTemplate[] = [
  {
    id: "license",
    icon: "🚗",
    title: "Führerschein",
    costLabel: "3.500 €",
    typicalCostLabel: "Typisch etwa 3.500 €",
    costMin: 3500,
    costMax: 3500,
    defaultAge: 17,
    defaultAmount: -3500,
  },
  {
    id: "study",
    icon: "🎓",
    title: "Studium starten",
    costLabel: "5.000 – 10.000 €",
    typicalCostLabel: "Typisch etwa 10.000 €",
    costMin: 5000,
    costMax: 10000,
    defaultAge: 18,
    defaultAmount: -7500,
  },
  {
    id: "gapyear",
    icon: "🌍",
    title: "Auslandsjahr",
    costLabel: "8.000 – 15.000 €",
    typicalCostLabel: "Typisch etwa 12.000 €",
    costMin: 8000,
    costMax: 15000,
    defaultAge: 18,
    defaultAmount: -11500,
  },
  {
    id: "flat",
    icon: "🏡",
    title: "Erste Wohnung",
    costLabel: "6.000 – 10.000 €",
    typicalCostLabel: "Typisch etwa 8.000 €",
    costMin: 6000,
    costMax: 10000,
    defaultAge: 25,
    defaultAmount: -8000,
  },
];

interface MilestonesSectionProps {
  milestones: Milestone[];
  milestoneDetails?: Map<string, MilestoneDetail>;
  finalBalance?: number;
  onAdd: () => void;
  onAddFromTemplate?: (template: MilestoneTemplate) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export function MilestonesSection({
  milestones,
  milestoneDetails = new Map(),
  finalBalance = 0,
  onAdd,
  onAddFromTemplate,
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
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Finanzielle Meilensteine
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Plane wichtige Lebensereignisse deines Kindes und sieh direkt, wie
          sie den Vermögensverlauf beeinflussen.
        </p>
      </div>

      {/* Gruppe 1: Typische Lebensereignisse */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Typische Lebensereignisse
        </h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {LIFEEVENT_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="text-xl">{template.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {template.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {template.typicalCostLabel}
                  </p>
                </div>
              </div>
              {onAddFromTemplate && (
                <button
                  type="button"
                  onClick={() => onAddFromTemplate(template)}
                  className="shrink-0 rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-sky-700"
                >
                  Hinzufügen
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gruppe 2: Freie Meilensteine */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Deine Meilensteine
          </h3>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-200"
          >
            + Meilenstein hinzufügen
          </button>
        </div>

      {milestones.length > 0 ? (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sorted.map((m, index) => {
              const isIncome = m.amount > 0;
              const hasPreviousExpenseMilestones = sorted
                .slice(0, index)
                .some((prev) => prev.amount < 0);
              const pillColor = isIncome
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700";
              const detail = milestoneDetails.get(m.id);

              const statusTone =
                detail?.status === "finanzierbar"
                  ? "text-emerald-600"
                  : detail?.status === "teilweise finanzierbar"
                    ? "text-amber-600"
                    : detail?.status === "nicht finanzierbar"
                      ? "text-rose-600"
                      : "";

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

                  <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    <p className="font-medium text-slate-900">
                      Kosten: {formatCurrency(Math.abs(m.amount))}
                    </p>
                    {detail != null && (
                      <>
                        <p>
                          Vermögen mit {Math.round(m.age)} Jahren:{" "}
                          {formatCurrency(detail.balanceAtAge)}
                        </p>
                        {hasPreviousExpenseMilestones && (
                          <p className="text-xs text-slate-400">
                            nach vorherigen Meilensteinen berechnet
                          </p>
                        )}
                        <p>
                          Verbleibend danach:{" "}
                          {formatCurrency(detail.balanceAfter)}
                        </p>
                        {detail.shortfall > 0 && (
                          <p className="font-medium text-rose-600">
                            Fehlbetrag: {formatCurrency(detail.shortfall)}
                          </p>
                        )}
                        {detail.status != null && (
                          <p className={`font-medium ${statusTone}`}>
                            Status: {detail.status}
                          </p>
                        )}
                        {!isIncome && detail.cost > 0 && (
                          <div className="mt-2">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-sky-500 transition-all"
                                style={{
                                  width: `${Math.min(100, detail.progressPercent)}%`,
                                }}
                              />
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {Math.round(detail.progressPercent)} %
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <p className="font-semibold text-slate-900">
                      {formatCurrencyWithSign(m.amount)}
                    </p>
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
                </article>
              );
            })}
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
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Noch keine Meilensteine hinzugefügt. Füge einen Meilenstein hinzu, um
          den Sparplan realistischer zu planen.
        </p>
      )}
      </div>
    </section>
  );
}


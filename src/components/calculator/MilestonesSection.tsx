import { useState } from "react";

import { formatCurrency, formatCurrencyWithSign } from "@/lib/format";
import type { Milestone, MilestoneDetail } from "@/types/calculator";

export interface SavingsRecommendation {
  recommendedMonthly: number;
  deltaFromCurrent: number;
}

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
  recommendation?: SavingsRecommendation | null;
  onApplyRecommended?: (amount: number) => void;
  finalBalance?: number;
  onAdd: () => void;
  onAddFromTemplate?: (template: MilestoneTemplate) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export function MilestonesSection({
  milestones,
  milestoneDetails = new Map(),
  recommendation = null,
  onApplyRecommended,
  finalBalance = 0,
  onAdd,
  onAddFromTemplate,
  onEdit,
  onDelete,
}: MilestonesSectionProps) {
  const sorted = [...milestones].sort((a, b) => a.age - b.age);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  const getIconForMilestone = (m: Milestone): string => {
    const templateMatch = LIFEEVENT_TEMPLATES.find(
      (t) => t.title.toLowerCase() === m.title.toLowerCase(),
    );
    if (templateMatch) return templateMatch.icon;

    const title = m.title.toLowerCase();
    if (title.includes("führerschein")) return "🚗";
    if (title.includes("auslandsjahr") || title.includes("welt")) return "🌍";
    if (title.includes("studium") || title.includes("studien")) return "🎓";
    if (title.includes("wohnung") || title.includes("immobilie") || title.includes("haus"))
      return "🏡";
    return "🎯";
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-900/5 md:p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Welche Schritte möchtest du ermöglichen?
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
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="text-xl">➕</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Eigenes Lebensereignis
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Plane ein individuelles Ereignis mit eigenem Zeitpunkt und Kosten.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAdd}
              className="shrink-0 rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-sky-700"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Gruppe 2: Finanzierungsstatus */}
      <div className="mt-4">
        {milestones.length > 0 && recommendation != null && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              Nicht alle Meilensteine sind aktuell finanzierbar.
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Mit ca. {formatCurrency(recommendation.deltaFromCurrent).replace("€", "€")} mehr pro
              Monat könnte der Plan aufgehen.
            </p>
            <p className="mt-1 text-sm font-medium text-amber-900">
              Empfohlene Sparrate:{" "}
              {formatCurrency(recommendation.recommendedMonthly).replace("€", "€")} / Monat
            </p>
            {onApplyRecommended && (
              <button
                type="button"
                onClick={() =>
                  onApplyRecommended(recommendation.recommendedMonthly)
                }
                className="mt-3 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
              >
                {formatCurrency(recommendation.recommendedMonthly).replace("€", "€")} übernehmen
              </button>
            )}
          </div>
        )}

        {milestones.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-[11px] text-slate-900 shadow-sm shadow-slate-200">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Finanzierungsstatus deiner Meilensteine
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Sieh auf einen Blick, welche Ziele bereits voll oder teilweise finanziert sind.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {sorted
                .filter((m) => m.amount < 0)
                .map((m) => {
                  const detail = milestoneDetails.get(m.id);
                  if (!detail || detail.cost <= 0) return null;

                  const progress = Math.min(100, Math.round(detail.progressPercent));
                  const financedAmount = detail.cost - detail.shortfall;
                  const missingAmount = detail.shortfall;

                  let barColor = "bg-slate-500";
                  let statusTextColor = "text-slate-100";
                  if (detail.status === "finanzierbar") {
                    barColor = "bg-emerald-400";
                    statusTextColor = "text-emerald-200";
                  } else if (detail.status === "teilweise finanzierbar") {
                    barColor = "bg-amber-400";
                    statusTextColor = "text-amber-200";
                  } else if (detail.status === "nicht finanzierbar") {
                    barColor = "bg-rose-400";
                    statusTextColor = "text-rose-200";
                  }

                  return (
                    <div
                      key={`status-${m.id}`}
                      className="flex flex-col justify-between rounded-xl bg-white px-3 py-3 shadow-sm shadow-slate-200 ring-1 ring-slate-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getIconForMilestone(m)}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {m.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Alter {Math.round(m.age)} – Ziel:{" "}
                              {formatCurrency(Math.abs(m.amount))}
                            </p>
                          </div>
                        </div>
                        {detail.status && (
                          <span className={`text-[10px] font-medium ${statusTextColor}`}>
                            {detail.status}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-600">
                          {progress} %
                        </p>
                      </div>
                      <div className="mt-1 space-y-0.5 text-[10px] text-slate-700">
                        {progress >= 100 ? (
                          <p>
                            {formatCurrency(detail.cost)} finanziert
                          </p>
                        ) : (
                          <>
                            <p>
                              {formatCurrency(financedAmount)} von{" "}
                              {formatCurrency(detail.cost)} finanziert
                            </p>
                            {missingAmount > 0 && (
                              <p className="text-rose-200">
                                Fehlen: {formatCurrency(missingAmount)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      {openDetailId === m.id && (
                        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-700">
                          <p className="font-semibold text-slate-900">
                            Vermögen mit {Math.round(m.age)} Jahren
                          </p>
                          <p className="mt-0.5">
                            <span className="font-semibold">
                              {formatCurrency(detail.balanceAtAge)}
                            </span>
                          </p>
                          <p className="mt-1 text-slate-700">
                            Kosten
                            {" "}
                            <span className="font-semibold">
                              {formatCurrency(-Math.abs(m.amount))}
                            </span>
                          </p>
                          <p className="mt-1 text-slate-700">
                            Verbleibend danach
                            {" "}
                            <span className="font-semibold">
                              {formatCurrency(detail.balanceAfter)}
                            </span>
                          </p>
                          {detail.status && (
                            <p className="mt-1 text-slate-700">
                              Status
                              {" "}
                              <span className="font-semibold">
                                {detail.status}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDetailId(
                              openDetailId === m.id ? null : m.id,
                            )
                          }
                          className="text-[10px] font-medium text-slate-700 underline-offset-2 hover:underline"
                        >
                          {openDetailId === m.id
                            ? "Details ausblenden"
                            : "Details zur Berechnung anzeigen"}
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(m)}
                            className="text-[10px] text-slate-600 hover:text-slate-900"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(m.id)}
                            className="text-[10px] text-rose-500 hover:text-rose-700"
                          >
                            Entfernen
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
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


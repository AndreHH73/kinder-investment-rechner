import type { ReactNode } from "react";
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

function TemplateIcon({ id }: { id: string }) {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true" as const,
  };

  if (id === "license") {
    return (
      <svg {...common}>
        <path
          d="M6.5 15.5h11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7.5 11.5l1.4-2.6c.3-.6.9-.9 1.6-.9h2c.7 0 1.3.3 1.6.9l1.4 2.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 15.5V13c0-.5.2-1 .6-1.3l1.3-1c.3-.2.7-.4 1.1-.4h4.9c.4 0 .8.1 1.1.4l1.3 1c.4.3.6.8.6 1.3v2.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 16.25a1.25 1.25 0 1 1-2.5 0A1.25 1.25 0 0 1 9 16.25zM17.5 16.25a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9.75 11.25h.01M14.25 11.25h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (id === "study") {
    return (
      <svg {...common}>
        <path
          d="M12 4l9 5-9 5L3 9l9-5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M7 12v4.5c0 .6.32 1.16.84 1.46C9.06 18.6 10.5 19 12 19s2.94-.4 4.16-1.04c.52-.3.84-.86.84-1.46V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (id === "gapyear") {
    return (
      <svg {...common}>
        <path
          d="M4 15.5l7.5-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11.5 13.5l6.5-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 6.5l4.5 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13 5l2.5 1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // flat
  return (
    <svg {...common}>
      <path
        d="M4 10.5L12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 21v-6a2 2 0 0 1 4 0v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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
  /** Wenn gesetzt (z. B. Mobile): wird zwischen Auswahl und Finanzierungsstatus gerendert; Finanzierungsstatus nur bei milestones.length > 0 */
  slotBetweenSelectionAndFinancing?: ReactNode;
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
  slotBetweenSelectionAndFinancing,
}: MilestonesSectionProps) {
  const sorted = [...milestones].sort((a, b) => a.age - b.age);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const isMobileVariant = slotBetweenSelectionAndFinancing != null;

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

  const sectionClass =
    "rounded-3xl bg-white p-5 shadow-sm shadow-slate-900/5 md:p-6";

  const selectionBlock = (
    <>
      <div className={isMobileVariant ? "space-y-2" : ""}>
        <h2
          className={
            isMobileVariant
              ? "typo-a1 max-w-[26ch] text-balance leading-snug text-slate-900"
              : "typo-a1 text-slate-900"
          }
        >
          Welche Lebensschritte möchtest du für dein Kind ermöglichen?
        </h2>
        <p
          className={
            isMobileVariant
              ? "typo-a2 max-w-[46ch] leading-relaxed text-slate-500"
              : "typo-a2 mt-1 text-slate-500"
          }
        >
          Plane wichtige Lebensschritte deines Kindes und sieh direkt, wie
          sie den Vermögensverlauf beeinflussen.
        </p>
      </div>
      <div className={isMobileVariant ? "mt-6" : "mt-5"}>
        <h3 className="typo-a3 text-slate-500">
          Typische Lebensschritte
        </h3>
        <div
          className={
            isMobileVariant
              ? "mt-3 grid gap-2.5 sm:grid-cols-2"
              : "mt-2 grid gap-3 sm:grid-cols-2"
          }
        >
          {LIFEEVENT_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={
                isMobileVariant
                  ? "flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                  : "flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              }
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={
                    isMobileVariant
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/60 text-emerald-700"
                      : ""
                  }
                  aria-hidden
                >
                  {isMobileVariant ? (
                    <TemplateIcon id={template.id} />
                  ) : (
                    <span className="text-xl">{template.icon}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={
                      isMobileVariant
                        ? "text-[14px] font-semibold leading-snug text-slate-900"
                        : "typo-a4-medium text-slate-900"
                    }
                  >
                    {template.title}
                  </p>
                  <p
                    className={
                      isMobileVariant
                        ? "mt-0.5 text-[12px] leading-snug text-slate-500"
                        : "typo-a4 mt-0.5 text-slate-500"
                    }
                  >
                    {template.typicalCostLabel}
                  </p>
                </div>
              </div>

              {onAddFromTemplate && (
                <button
                  type="button"
                  onClick={() => onAddFromTemplate(template)}
                  aria-label={`${template.title} hinzufügen`}
                  className={
                    isMobileVariant
                      ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#86BFA8] text-white shadow-[0_10px_22px_-18px_rgba(2,44,30,0.55)] transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#F9FBFA]"
                      : "typo-a4 shrink-0 rounded-full bg-[#86BFA8] px-3 py-1.5 font-semibold text-white shadow-xl shadow-emerald-900/10 transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#F9FBFA]"
                  }
                >
                  {isMobileVariant ? (
                    <span
                      className="text-[18px] font-semibold leading-none"
                      aria-hidden
                    >
                      +
                    </span>
                  ) : (
                    "Hinzufügen"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <div
          className={
            isMobileVariant
              ? "mt-4 rounded-2xl border border-dashed border-emerald-200/70 bg-emerald-50/30 p-2.5"
              : "mt-3"
          }
        >
          <button
            type="button"
            onClick={onAdd}
            className={
              isMobileVariant
                ? "flex w-full items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3 text-left transition-colors active:opacity-90"
                : "flex w-full items-center gap-3 rounded-2xl bg-[#86BFA8] px-4 py-3 text-left font-semibold text-white shadow-xl shadow-emerald-900/10 transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#F9FBFA] active:opacity-90"
            }
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M8 6h13M8 12h13M8 18h13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 6h.01M3 12h.01M3 18h.01"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="min-w-0 text-[14px] font-semibold leading-snug text-emerald-700">
                Eigenen Lebensschritt planen
              </p>
            </div>
          </button>
        </div>
      </div>
    </>
  );

  const financingBlock = (
    <div className="mt-4">
        {milestones.length > 0 && recommendation != null && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="typo-a4-medium text-amber-900">
              Nicht alle Lebensschritte sind aktuell finanzierbar.
            </p>
            <p className="typo-a4 mt-1 text-amber-800">
              Mit ca. {formatCurrency(recommendation.deltaFromCurrent).replace("€", "€")} mehr pro
              Monat könnte der Plan aufgehen.
            </p>
            <p className="typo-a4 mt-1 font-medium text-amber-900">
              Empfohlene Sparrate:{" "}
              {formatCurrency(recommendation.recommendedMonthly).replace("€", "€")} / Monat
            </p>
            {onApplyRecommended && (
              <button
                type="button"
                onClick={() =>
                  onApplyRecommended(recommendation.recommendedMonthly)
                }
                className="typo-a4 mt-3 rounded-full bg-amber-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-amber-700"
              >
                {formatCurrency(recommendation.recommendedMonthly).replace("€", "€")} übernehmen
              </button>
            )}
          </div>
        )}

        {milestones.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-slate-900 shadow-sm shadow-slate-200">
            <p className="typo-a3 text-slate-500">
              Finanzierungsstatus deiner Lebensschritte
            </p>
            <p className="typo-a2 mt-1 text-slate-600">
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
                            <p className="typo-a4-medium text-slate-900">
                              {m.title}
                            </p>
                            <p className="typo-a4 text-slate-500">
                              Alter {Math.round(m.age)} – Ziel:{" "}
                              {formatCurrency(Math.abs(m.amount))}
                            </p>
                          </div>
                        </div>
                        {detail.status && (
                          <span className={`typo-a4 font-medium ${statusTextColor}`}>
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
                        <p className="typo-a4 mt-1 text-slate-600">
                          {progress} %
                        </p>
                      </div>
                      <div className="typo-a4 mt-1 space-y-0.5 text-slate-700">
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
                        <div className="typo-a4 mt-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
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
                          className="typo-a4 font-medium text-slate-700 underline-offset-2 hover:underline"
                        >
                          {openDetailId === m.id
                            ? "Details ausblenden"
                            : "Details anzeigen"}
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(m)}
                            className="typo-a4 text-slate-600 hover:text-slate-900"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(m.id)}
                            className="typo-a4 text-rose-500 hover:text-rose-700"
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
          <p className="typo-a2 mt-4 text-slate-500">
            Noch keine Lebensschritte hinzugefügt. Füge einen Lebensschritt hinzu, um
            den Sparplan realistischer zu planen.
          </p>
        )}
    </div>
  );

  if (slotBetweenSelectionAndFinancing != null) {
    return (
      <>
        <section className={sectionClass}>{selectionBlock}</section>
        {slotBetweenSelectionAndFinancing}
        {milestones.length > 0 && (
          <section className={sectionClass}>{financingBlock}</section>
        )}
      </>
    );
  }

  return (
    <section className={sectionClass}>
      {selectionBlock}
      {financingBlock}
    </section>
  );
}


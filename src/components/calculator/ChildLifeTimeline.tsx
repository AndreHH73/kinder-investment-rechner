import { formatCurrency } from "@/lib/format";
import { HeroResultLight } from "@/components/calculator/HeroResultLight";
import type {
  Milestone,
  MilestoneDetail,
  CalculatorSimulationResult,
  CalculatorInputs,
} from "@/types/calculator";

interface ChildLifeTimelineProps {
  milestones: Milestone[];
  simulation: CalculatorSimulationResult | null;
  /** Ohne eingebettete Ergebnis-Karte (z. B. wenn der Hero separat oben steht) */
  omitHeroSummary?: boolean;
  className?: string;
}

export function ChildLifeTimeline({
  milestones,
  simulation,
  omitHeroSummary = false,
  className = "",
}: ChildLifeTimelineProps) {
  if (!simulation) return null;

  const { core, milestoneDetails } = simulation;
  const years = core.years;
  if (!years || years.length === 0) return null;

  const startYear = years[0];
  const endYear = years[years.length - 1];

  const sorted = [...milestones].sort((a, b) => a.age - b.age);

  const getDetail = (id: string): MilestoneDetail | undefined =>
    milestoneDetails.get(id);

  const getStatusIcon = (status: MilestoneDetail["status"]) => {
    if (status === "finanzierbar") return "✔";
    if (status === "teilweise finanzierbar") return "⚠";
    if (status === "nicht finanzierbar") return "❌";
    return "•";
  };

  const getStatusColor = (status: MilestoneDetail["status"]) => {
    if (status === "finanzierbar") return "text-emerald-600";
    if (status === "teilweise finanzierbar") return "text-amber-600";
    if (status === "nicht finanzierbar") return "text-rose-600";
    return "text-slate-500";
  };

  const getIconForMilestone = (m: Milestone | { title: string }): string => {
    const title = m.title.toLowerCase();
    if (title.includes("führerschein")) return "🚗";
    if (title.includes("auslandsjahr") || title.includes("welt")) return "🌍";
    if (title.includes("studium") || title.includes("studien")) return "🎓";
    if (title.includes("wohnung") || title.includes("immobilie") || title.includes("haus"))
      return "🏡";
    return "🎯";
  };

  const hasMilestones = sorted.length > 0;

  // Hilfsfunktion: nächstes Jahr im Simulationsergebnis suchen
  const getYearAtAge = (age: number) =>
    years.find((y) => Math.round(y.age) === Math.round(age));

  type TimelineItem =
    | { type: "start"; label: string; age: number; description: string }
    | { type: "end"; label: string; age: number; description: string }
    | {
        type: "milestone";
        age: number;
        milestone: Milestone;
        detail: MilestoneDetail | undefined;
      }
    | { type: "fixed"; age: number; label: string; description: string };

  const baseStationsRaw = hasMilestones
    ? []
    : [16, 18, 25].map((age) => {
        const year = getYearAtAge(age);
        if (!year) return null;
        return {
          type: "fixed" as const,
          age: year.age,
          label: `Vermögen mit ${Math.round(year.age)} Jahren`,
          description: formatCurrency(year.endingBalance),
        };
      });

  type FixedStation = Extract<TimelineItem, { type: "fixed" }>;
  const baseStations = baseStationsRaw.filter(
    (item): item is FixedStation => item !== null,
  );

  const timelineItemsRaw: (TimelineItem | null)[] = [
    {
      type: "start",
      label: "Start des Sparplans",
      age: startYear.age,
      description: `Startvermögen: ${formatCurrency(startYear.startingBalance)}`,
    },
    ...sorted.map((m) => {
      const detail = getDetail(m.id);
      return {
        type: "milestone" as const,
        age: m.age,
        milestone: m,
        detail,
      };
    }),
    ...baseStations,
    {
      type: "end",
      label: "Zielvermögen",
      age: endYear.age,
      description: formatCurrency(core.finalBalance),
    },
  ];

  const items = timelineItemsRaw
    .filter((item): item is TimelineItem => item !== null)
    .sort((a, b) => a.age - b.age);

  const heroInputs: CalculatorInputs = {
    monthlyContribution: 0,
    childAge: Math.round(startYear.age),
    targetAge: Math.round(endYear.age),
    expectedReturnPercentPerYear: 0,
    initialLumpSum: 0,
  };

  return (
    <section
      id="child-life-timeline"
      className={`mx-auto w-full max-w-[480px] rounded-3xl bg-white shadow-sm shadow-slate-900/5 lg:max-w-none ${className}`}
    >
      {!omitHeroSummary && (
        <div className="px-4 pt-4">
          <HeroResultLight
            inputs={heroInputs}
            simulation={core}
            hasMilestones
          />
        </div>
      )}

      <div
        className={
          omitHeroSummary ? "px-6 pb-6 pt-6" : "px-6 pb-6 pt-4"
        }
      >
        <h2 className="typo-a1 text-slate-900">Der Lebensweg deines Kindes</h2>
        <p className="typo-a2 mt-2 text-slate-600">
          Plane die wichtigsten Lebensschritte deines Kindes – und sieh sofort, ob dein Sparplan dafür reicht.
        </p>
        <p className="typo-a4 mt-1 text-slate-500">
          Sieh, wie sich das Vermögen über den Lebensweg entwickelt – mit oder ohne geplante Lebensschritte.
        </p>

        <div className="mt-6 relative pl-6">
          {/* Feine vertikale Verbindungslinie (durch die Alterskreise geführt) */}
          <div
            className="absolute left-[44px] top-2 bottom-2 w-[1.25px] bg-[#86BFA8]"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-4">
            {items.map((item, index) => {
              const age = Math.round(item.age);

              return (
                <div key={index} className="flex items-start gap-4">
                  {/* Age marker links */}
                  <div className="relative z-10 flex w-10 flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#86BFA8] text-[12px] font-bold text-white shadow-[0_10px_20px_-15px_rgba(2,44,30,0.35)]">
                      {age}
                    </div>
                  </div>

                  {/* Station content */}
                  <div className="flex-1 space-y-0.5">
                    {item.type === "start" && (
                      <>
                        <p className="typo-a4-medium text-slate-900">
                          Start des Sparplans
                        </p>
                        <p className="typo-a4 text-slate-600">
                          {item.description}
                        </p>
                      </>
                    )}

                    {item.type === "fixed" && (
                      <>
                        <p className="typo-a4-medium text-slate-900">
                          {item.label}
                        </p>
                        <p className="typo-a4 text-slate-600">
                          Vermögen danach:{" "}
                          <span className="font-semibold text-[#86BFA8]">
                            {item.description}
                          </span>
                        </p>
                      </>
                    )}

                    {item.type === "end" && (
                      <>
                        <p className="typo-a4-medium text-slate-900">
                          Zielvermögen
                        </p>
                        <p className="typo-a4 text-slate-600">
                          Mit {age} Jahren
                        </p>
                        <p className="typo-a4-medium text-[#86BFA8]">
                          {item.description}
                        </p>
                      </>
                    )}

                    {item.type === "milestone" && item.milestone && (
                      <>
                        <p className="typo-a4-medium text-slate-900">
                          {item.milestone.title}
                        </p>
                        {item.detail && (
                          <>
                            <p className="typo-a4 text-slate-600">
                              Kosten:{" "}
                              <span className="font-semibold text-rose-600">
                                {formatCurrency(
                                  Math.abs(item.milestone.amount),
                                )}
                              </span>
                            </p>
                            <p className="typo-a4 text-slate-600">
                              Vermögen danach:{" "}
                              <span className="font-semibold text-[#86BFA8]">
                                {formatCurrency(item.detail.balanceAfter)}
                              </span>
                            </p>
                            {item.detail.status && (
                              <p
                                className={`typo-a4 mt-0.5 font-medium ${getStatusColor(
                                  item.detail.status,
                                )}`}
                              >
                                {item.detail.status}
                              </p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!hasMilestones && (
          <div className="typo-a4 mt-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/25 px-4 py-3 text-slate-700 shadow-sm shadow-slate-900/5">
            <p className="typo-a4-medium">Noch keine Lebensschritte geplant</p>
            <p className="typo-a2 mt-0.5">
              Füge typische Lebensschritte hinzu, um den Sparplan realistischer zu
              planen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}


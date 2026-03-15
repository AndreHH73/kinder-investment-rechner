import { formatCurrency } from "@/lib/format";
import type {
  Milestone,
  MilestoneDetail,
  CalculatorSimulationResult,
} from "@/types/calculator";

interface ChildLifeTimelineProps {
  milestones: Milestone[];
  simulation: CalculatorSimulationResult | null;
}

export function ChildLifeTimeline({
  milestones,
  simulation,
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

  return (
    <section
      id="child-life-timeline"
      className="mx-auto w-full max-w-[480px] rounded-3xl p-8 shadow-xl shadow-slate-900/40"
      style={{
        background:
          "linear-gradient(135deg, #0F2A44 0%, #1C4E80 60%, #0F2A44 100%)",
      }}
    >
      <h2 className="typo-a1 text-slate-50">
        Der Lebensweg deines Kindes
      </h2>
      <p className="typo-a2 mt-2 text-blue-100">
        Plane die wichtigsten Lebensschritte deines Kindes – und sieh sofort, ob dein Sparplan dafür reicht.
      </p>
      <p className="typo-a4 mt-1 text-blue-200/80">
        Sieh, wie sich das Vermögen über den Lebensweg entwickelt – mit oder ohne geplante Lebensschritte.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <div
              key={index}
              className="typo-a4 flex items-stretch gap-3 text-blue-50"
            >
              {/* Left: Age */}
              <div className="typo-a3 w-16 text-right text-blue-100">
                {Math.round(item.age)} Jahre
              </div>

              {/* Middle: Timeline */}
              <div className="flex w-10 flex-col items-center">
                {!isFirst && (
                  <div className="h-4 w-px bg-blue-300/60" aria-hidden="true" />
                )}
                <div className="flex h-8 items-center">
                  <div className="h-4 w-4 rounded-full bg-sky-400 shadow-sm shadow-sky-900/40" />
                </div>
                {!isLast && (
                  <div className="flex-1 w-px bg-blue-300/60" aria-hidden="true" />
                )}
              </div>

              {/* Right: Content – reine Text-Timeline */}
              <div className="flex-1 space-y-1">
                {item.type === "start" && (
                  <>
                    <p className="typo-a4-medium text-slate-50">
                      Start des Sparplans
                    </p>
                    <p className="typo-a4 text-blue-100">
                      {item.description}
                    </p>
                  </>
                )}

                {item.type === "fixed" && (
                  <>
                    <p className="typo-a4-medium text-slate-50">
                      {item.label}
                    </p>
                    <p className="typo-a4 text-blue-100">
                      Vermögen danach:{" "}
                      <span className="font-semibold text-emerald-200">
                        {item.description}
                      </span>
                    </p>
                  </>
                )}

                {item.type === "end" && (
                  <>
                    <p className="typo-a4-medium text-slate-50">
                      🏁 Zielvermögen
                    </p>
                    <p className="typo-a4 text-blue-100">
                      Mit {Math.round(item.age)} Jahren
                    </p>
                    <p className="typo-a4-medium text-emerald-300">
                      {item.description}
                    </p>
                  </>
                )}

                {item.type === "milestone" && item.milestone && (
                  <>
                    <p className="typo-a4-medium text-slate-50">
                      <span className="mr-1 text-lg">
                        {getIconForMilestone(item.milestone)}
                      </span>
                      {item.milestone.title}
                    </p>
                    {item.detail && (
                      <>
                        <p className="typo-a4 text-blue-100">
                          Kosten:{" "}
                          <span className="font-semibold text-rose-200">
                            {formatCurrency(Math.abs(item.milestone.amount))}
                          </span>
                        </p>
                        <p className="typo-a4 text-blue-100">
                          Vermögen danach:{" "}
                          <span className="font-semibold text-emerald-200">
                            {formatCurrency(item.detail.balanceAfter)}
                          </span>
                        </p>
                        {item.detail.status && (
                          <p
                            className={`typo-a4 mt-0.5 font-medium ${getStatusColor(
                              item.detail.status,
                            )}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(item.detail.status)}
                            </span>
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
      {!hasMilestones && (
        <div className="typo-a4 mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-slate-600">
          <p className="typo-a4-medium">Noch keine Lebensschritte geplant</p>
          <p className="typo-a2 mt-0.5">
            Füge typische Lebensschritte hinzu, um den Sparplan realistischer zu planen.
          </p>
        </div>
      )}
    </section>
  );
}


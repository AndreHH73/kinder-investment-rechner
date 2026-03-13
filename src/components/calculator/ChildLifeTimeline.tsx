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

  const hasMilestones = sorted.length > 0;

  // Hilfsfunktion: nächstes Jahr im Simulationsergebnis suchen
  const getYearAtAge = (age: number) =>
    years.find((y) => Math.round(y.age) === Math.round(age));

  const baseStations =
    hasMilestones
      ? []
      : [
          ...[16, 18, 25].map((age) => {
            const year = getYearAtAge(age);
            if (!year) return null;
            return {
              type: "fixed" as const,
              age: year.age,
              label: `Vermögen mit ${Math.round(year.age)} Jahren`,
              description: formatCurrency(year.endingBalance),
            };
          }),
        ].filter(Boolean);

  const items = [
    {
      type: "start" as const,
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
      type: "end" as const,
      label: "Zielvermögen",
      age: endYear.age,
      description: formatCurrency(core.finalBalance),
    },
  ].sort((a, b) => a.age - b.age);

  return (
    <section className="mx-auto w-full max-w-[420px] rounded-3xl bg-surface p-4 shadow-sm shadow-primary/5">
      <h2 className="text-sm font-semibold text-slate-900">
        Lebensweg deines Kindes
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Sieh, wie sich das Vermögen über den Lebensweg entwickelt – mit oder ohne geplante Meilensteine.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <div
              key={index}
              className="flex items-stretch gap-3 text-xs text-slate-700"
            >
              {/* Left: Age */}
              <div className="w-14 text-right text-[11px] font-medium text-slate-500">
                {Math.round(item.age)} Jahre
              </div>

              {/* Middle: Timeline */}
              <div className="flex w-8 flex-col items-center">
                {!isFirst && (
                  <div className="h-4 w-px bg-slate-200" aria-hidden="true" />
                )}
                <div className="flex h-6 items-center">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                </div>
                {!isLast && (
                  <div className="flex-1 w-px bg-slate-200" aria-hidden="true" />
                )}
              </div>

              {/* Right: Content */}
              <div className="flex-1">
                {item.type === "start" && (
                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-900">
                      Start des Sparplans
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {item.description}
                    </p>
                  </div>
                )}

                {item.type === "fixed" && (
                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {item.description}
                    </p>
                  </div>
                )}

                {item.type === "end" && (
                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-900">
                      Zielvermögen
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Mit {Math.round(item.age)} Jahren
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                      {item.description}
                    </p>
                  </div>
                )}

                {item.type === "milestone" && item.milestone && (
                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-900">
                      {item.milestone.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Kosten: {formatCurrency(item.milestone.amount)}
                    </p>
                    {item.detail && (
                      <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                        <p>
                          Vermögen vorher:{" "}
                          <span className="font-semibold">
                            {formatCurrency(item.detail.balanceAtAge)}
                          </span>
                        </p>
                        <p>
                          Vermögen danach:{" "}
                          <span className="font-semibold">
                            {formatCurrency(item.detail.balanceAfter)}
                          </span>
                        </p>
                        {item.detail.status && (
                          <p
                            className={`mt-0.5 font-medium ${getStatusColor(
                              item.detail.status,
                            )}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(item.detail.status)}
                            </span>
                            {item.detail.status}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!hasMilestones && (
        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
          <p className="font-medium">Noch keine Meilensteine geplant</p>
          <p className="mt-0.5">
            Füge typische Lebensereignisse hinzu, um den Sparplan realistischer zu planen.
          </p>
        </div>
      )}
    </section>
  );
}


/* eslint-disable import/no-extraneous-dependencies */
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatAgeYears, formatCurrency } from "@/lib/format";
import type { SimulationPoint } from "@/types/calculator";

interface GrowthChartProps {
  points: SimulationPoint[];
  compareEnabled: boolean;
  onToggleCompare: (enabled: boolean) => void;
  comparisonRange: number;
  onRangeChange: (range: number) => void;
  baseMonthly: number;
  lowerMonthly: number;
  higherMonthly: number;
  ahaDifference: number;
}

export function GrowthChart({
  points,
  compareEnabled,
  onToggleCompare,
  comparisonRange,
  onRangeChange,
  baseMonthly,
  lowerMonthly,
  higherMonthly,
  ahaDifference,
}: GrowthChartProps) {
  const startAge = points[0]?.age ?? 0;
  const endAge = points[points.length - 1]?.age ?? startAge;
  const startYear = Math.floor(startAge);
  const endYear = Math.floor(endAge);

  const ticks: number[] = [];
  ticks.push(startYear);
  let t = Math.ceil((startYear + 1) / 5) * 5;
  while (t < endYear) {
    ticks.push(t);
    t += 5;
  }
  if (!ticks.includes(endYear)) {
    ticks.push(endYear);
  }

  if (points.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
        <h2 className="text-sm font-semibold text-slate-900">
          Vermögensentwicklung
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Die Grafik wird angezeigt, sobald eine gültige Simulation vorliegt.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Projektion der Vermögensentwicklung
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sieh, wie Sparraten, Zinseszins und Meilensteine das Vermögen deines
            Kindes über die Jahre beeinflussen.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => onToggleCompare(!compareEnabled)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${
              compareEnabled
                ? "border-primary bg-primary/5 text-primary"
                : "border-muted bg-background text-slate-600"
            }`}
          >
            <span
              className={`flex h-3 w-3 items-center justify-center rounded-full border ${
                compareEnabled
                  ? "border-primary bg-primary"
                  : "border-muted bg-surface"
              }`}
            >
              {compareEnabled && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>
            Szenarien vergleichen
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1">
            <span className="font-medium text-slate-600">Vergleichsspanne</span>
            {[50, 100, 200].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onRangeChange(value)}
                className={`rounded-full px-2 py-0.5 ${
                  comparisonRange === value
                    ? "bg-primary text-surface"
                    : "bg-surface text-slate-700"
                }`}
              >
                ±{value} €
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-slate-600">
        <p className="font-medium">Sparratenvergleich</p>
        <div className="mt-1 flex flex-wrap gap-3">
          <span>
            🔵 {formatCurrency(lowerMonthly).replace("€", "€ / Monat")}
          </span>
          <span className="font-semibold text-emerald-700">
            🟢 {formatCurrency(baseMonthly).replace("€", "€ / Monat")} (aktuell)
          </span>
          <span>
            ⚪ {formatCurrency(higherMonthly).replace("€", "€ / Monat")}
          </span>
        </div>
      </div>
      <div className="mt-4 h-80 w-full md:h-96">
        <ResponsiveContainer>
          <AreaChart data={points}>
            <defs>
              <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="contribFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="age"
              ticks={ticks}
              tickFormatter={(v) => `${Math.round(v)}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(v) =>
                new Intl.NumberFormat("de-DE", {
                  maximumFractionDigits: 0,
                }).format(v)
              }
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              cursor={{ stroke: "#cbd5f5", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const entry =
                  payload.find(
                    (e) =>
                      e.dataKey !== "contributionsValue" &&
                      e.dataKey !== "portfolioValue",
                  ) ??
                  payload.find((e) => e.dataKey === "portfolioValue") ??
                  payload[0];
                const key = entry.dataKey as string;
                const point = entry.payload as SimulationPoint;

                let portfolio = point.portfolioValue;
                let contributions = point.contributionsValue;
                if (key === "lowerPortfolioValue") {
                  portfolio = point.lowerPortfolioValue ?? point.portfolioValue;
                  contributions =
                    point.lowerContributionsValue ?? point.contributionsValue;
                } else if (key === "higherPortfolioValue") {
                  portfolio = point.higherPortfolioValue ?? point.portfolioValue;
                  contributions =
                    point.higherContributionsValue ?? point.contributionsValue;
                }

                return (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-md">
                    <p className="mb-1 font-medium text-slate-700">
                      Alter: {formatAgeYears(label as number)}
                    </p>
                    <p className="text-emerald-700">
                      Vermögen{" "}
                      <span className="ml-1 font-semibold">
                        {formatCurrency(portfolio)}
                      </span>
                    </p>
                    <p className="text-sky-700">
                      Eingezahlt{" "}
                      <span className="ml-1 font-semibold">
                        {formatCurrency(contributions)}
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="contributionsValue"
              stroke="#38bdf8"
              fill="url(#contribFill)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke="#16A34A"
              fill="url(#portfolioFill)"
              strokeWidth={0}
            />
            <Line
              type="monotone"
              dataKey="portfolioValue"
              stroke="#16A34A"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
            {compareEnabled && (
              <>
                <Line
                  type="monotone"
                  dataKey="lowerPortfolioValue"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="higherPortfolioValue"
                  stroke="#F59E0B"
                  strokeWidth={4}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {compareEnabled && ahaDifference > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3 text-[11px] text-amber-900">
          <span className="text-base">💡</span>
          <div>
            <p className="font-semibold">Aha-Effekt</p>
            <p className="mt-1">
              Schon +{comparisonRange} € monatlich erhöhen das Vermögen um{" "}
              <span className="font-semibold">
                {formatCurrency(ahaDifference)}
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </section>
  );
}


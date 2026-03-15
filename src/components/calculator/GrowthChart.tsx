/* eslint-disable import/no-extraneous-dependencies */
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartMilestone, SimulationPoint } from "@/types/calculator";

interface GrowthChartProps {
  points: SimulationPoint[];
  milestones?: ChartMilestone[];
}

export function GrowthChart({
  points,
  milestones = [],
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
    <section className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-900/5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Vermögensverlauf mit Lebensschritten
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          So wächst das Vermögen deines Kindes – inklusive geplanter Ausgaben unterwegs.
        </p>
      </div>
      <div className="mt-4 h-72 w-full">
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
            {milestones.map((m) => {
              const color =
                m.type === "income"
                  ? "#10B981"
                  : m.status === "finanzierbar"
                    ? "#0EA5E9"
                    : m.status === "teilweise finanzierbar"
                      ? "#F59E0B"
                      : m.status === "nicht finanzierbar"
                        ? "#EF4444"
                        : "#6B7280";
              return (
                <ReferenceLine
                  key={m.id}
                  x={m.age}
                  stroke={color}
                  strokeDasharray="0"
                  strokeOpacity={0}
                  ifOverflow="extendDomain"
                  label={{
                    value: Math.round(m.age).toString(),
                    position: "top",
                    fontSize: 10,
                    fill: color,
                    angle: 0,
                  }}
                />
              );
            })}
            {milestones.map((m) => {
              const color =
                m.type === "income"
                  ? "#10B981"
                  : m.status === "finanzierbar"
                    ? "#0EA5E9"
                    : m.status === "teilweise finanzierbar"
                      ? "#F59E0B"
                      : m.status === "nicht finanzierbar"
                        ? "#EF4444"
                        : "#6B7280";
              return (
                <ReferenceDot
                  key={`${m.id}-dot`}
                  x={m.age}
                  y={m.portfolioValue}
                  r={5}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Der Verlauf zeigt das Vermögen nach Finanzierung der Lebensschritte.
      </p>
    </section>
  );
}


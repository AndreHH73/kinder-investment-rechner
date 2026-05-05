"use client";

import { formatCurrency } from "@/lib/format";
import type { RecommendationSet } from "@/lib/simulation";

type DesktopRecommendationCardProps = {
  recommendation: RecommendationSet;
};

function normalizeLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function IconPlusCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 12l2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DesktopRecommendationCard({
  recommendation,
}: DesktopRecommendationCardProps) {
  const lines = recommendation.lines.map(normalizeLine).filter(Boolean);
  const delta = recommendation.increaseBaseRate?.delta ?? null;
  const recommendedRate = recommendation.increaseBaseRate?.recommended ?? null;

  const fundedCount = recommendation.eventEvaluations.filter(
    (event) => event.status === "finanziert",
  ).length;
  const totalCount = recommendation.eventEvaluations.length;

  const allFundable =
    totalCount > 0 &&
    recommendation.eventEvaluations.every((e) => e.status === "finanziert");

  if (allFundable) {
    return null;
  }

  const headlineFromDelta =
    delta != null
      ? `Erhöhe deine Sparrate um ${formatCurrency(delta)} / Monat`
      : null;

  const basisLineDuplicate = (line: string): boolean => {
    if (!recommendedRate) return false;
    return (
      line.includes("Basis-Sparrate") &&
      line.includes(String(recommendedRate)) &&
      line.includes("erhöhen")
    );
  };

  const infoBannerText =
    lines[0] ??
    "Aktuell gibt es noch offene Lebensschritte in deinem Plan.";

  let mainHeadline: string;
  if (headlineFromDelta) {
    mainHeadline = headlineFromDelta;
  } else {
    const candidate =
      lines.find(
        (line, i) =>
          i > 0 &&
          line !== infoBannerText &&
          !basisLineDuplicate(line),
      ) ?? lines[1];
    mainHeadline =
      candidate && candidate !== infoBannerText
        ? candidate
        : (lines[0] ?? "Passe deinen Sparplan gezielt an.");
    if (mainHeadline === infoBannerText && lines[1] && lines[1] !== infoBannerText) {
      mainHeadline = lines[1];
    }
  }

  const description =
    "So könnten alle aktuell geplanten Lebensschritte wieder vollständig erreichbar werden.";

  const alternativeLines = lines.filter(
    (line) =>
      line !== infoBannerText &&
      line !== mainHeadline &&
      !basisLineDuplicate(line),
  );

  const zusatzWert =
    delta != null ? `${formatCurrency(delta)} / Monat` : "—";

  const showAlternatives = alternativeLines.length > 0;

  return (
    <div className="hidden space-y-4 lg:block">
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium leading-relaxed text-emerald-900">
        {infoBannerText}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              DEIN NÄCHSTER SINNVOLLER SCHRITT
            </p>
            <h3 className="text-[30px] font-bold leading-tight text-slate-900">
              {mainHeadline}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{description}</p>
            <a
              href="#desktop-sparplan-anpassen"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#86BFA8] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_-18px_rgba(2,44,30,0.55)] transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white"
            >
              Sparplan anpassen →
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <IconPlusCircle className="mt-0.5 shrink-0 text-emerald-700" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  Zusätzlich nötig{" "}
                  <span className="font-semibold text-slate-900">{zusatzWert}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <IconCheckCircle className="mt-0.5 shrink-0 text-emerald-700" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  Aktuell gedeckt{" "}
                  <span className="font-semibold text-slate-900">
                    {fundedCount} von {totalCount} Schritten
                  </span>
                </p>
              </div>
            </div>

            {showAlternatives && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-medium text-slate-700">
                  Weitere Möglichkeiten
                </p>
                <ul className="mt-2 space-y-1">
                  {alternativeLines.slice(0, 2).map((line, idx) => (
                    <li key={`${idx}-${line}`}>
                      <a
                        href="#desktop-sparplan-anpassen"
                        className="block rounded-lg border border-transparent px-2 py-2 text-left text-xs font-medium text-emerald-800 transition-colors hover:border-emerald-200/80 hover:bg-white"
                      >
                        {line}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

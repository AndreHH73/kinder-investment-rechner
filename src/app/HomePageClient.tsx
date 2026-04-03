"use client";

/* eslint-disable import/no-extraneous-dependencies */

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CalculatorHeader } from "@/components/calculator/Header";
import { HeroIntro } from "@/components/calculator/HeroIntro";
import { HeroResultLight } from "@/components/calculator/HeroResultLight";
import { PlanBesprechenSection } from "@/components/calculator/PlanBesprechenSection";
import { PlanSummarySection } from "@/components/calculator/PlanSummarySection";
import { MilestoneForm } from "@/components/calculator/MilestoneForm";
import type { MilestoneTemplate } from "@/components/calculator/MilestonesSection";
import { MobileInputStep } from "@/components/calculator/MobileInputStep";
import { MobileResultStep } from "@/components/calculator/MobileResultStep";
import { SavePlanModal } from "@/components/calculator/SavePlanModal";
import { defaultInputs } from "@/data/defaultMilestones";
import { formatCurrency, formatPercent } from "@/lib/format";
import { trackEvent } from "@/lib/tracking";
import {
  getRecommendedMonthlyRate,
  runCalculatorSimulation,
} from "@/lib/simulation";
import type {
  ChartMilestone,
  CalculatorInputs,
  CalculatorSimulationResult,
  Milestone,
} from "@/types/calculator";

const DEFAULT_PINGUIN_ACCESS_URL = "https://www.4futurefamily.de/pinguin/access";

function DesktopResultGateOverlay({ accessUrl }: { accessUrl: string }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="max-w-[360px] rounded-2xl border border-emerald-200/70 bg-white/95 p-8 text-center shadow-[0_14px_32px_-22px_rgba(2,44,30,0.35)] backdrop-blur-sm">
        <p className="text-[17px] font-medium leading-relaxed text-slate-800">
          Willst du dein konkretes Ergebnis sehen und die Lebensschritte deines
          Kindes planen?
        </p>
        <a
          href={accessUrl}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-[#86BFA8] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_36px_-24px_rgba(2,44,30,0.55)] transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        >
          Ja, meinen Plan anzeigen
        </a>
      </div>
    </div>
  );
}

export default function HomePageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasAccessToken = Boolean(searchParams.get("t")?.trim());
  const pinguinAccessUrl =
    process.env.NEXT_PUBLIC_PINGUIN_ACCESS_URL?.trim() ||
    DEFAULT_PINGUIN_ACCESS_URL;

  const screenParam = searchParams.get("screen") ?? "intro";
  const isIntroScreen = screenParam === "intro";
  const isDesktopPlanScreen = screenParam === "plan";

  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [milestoneMode, setMilestoneMode] = useState<"create" | "edit">(
    "create",
  );
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [comparisonRange, setComparisonRange] = useState<number>(50);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [baselineScenario, setBaselineScenario] = useState<{
    monthly: number;
    endValue: number;
  } | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  /** Mobil: Lebensschritte-Ansicht per Schritt 2 oder Deep-Link ?screen=plan */
  const showMobilePlanStep =
    !isIntroScreen && (mobileStep === 2 || screenParam === "plan");

  /** Optional: NEXT_PUBLIC_BOOKING_URL überschreibt den Standard-Link aus PlanBesprechenSection */
  const bookingUrlOverride =
    process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || undefined;

  const heroRef = useRef<HTMLDivElement>(null);
  const heroScrollTimeoutRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);
  const shouldScrollToBaseInputsRef = useRef(false);
  const trackingTokenRef = useRef<string | null>(null);
  const hasTrackedResultRef = useRef(false);

  const {
    simulation,
    chartPoints,
    chartMilestones,
  }: {
    simulation: CalculatorSimulationResult | null;
    chartPoints: import("@/types/calculator").SimulationPoint[];
    chartMilestones: ChartMilestone[];
  } = useMemo(() => {
    const base = runCalculatorSimulation(inputs, milestones);
    const basePoints = base.points;

    // Baue Punkte mit sichtbaren "Drops" bei kostenpflichtigen Lebensschritten
    const chartPoints: import("@/types/calculator").SimulationPoint[] = [];
    if (basePoints.length > 0) {
      const expenseMilestones = milestones
        .filter((m) => m.amount < 0)
        .sort((a, b) => a.age - b.age);

      const remainingIds = new Set(expenseMilestones.map((m) => m.id));
      const getDetail = (id: string) => base.milestoneDetails.get(id);

      for (let i = 0; i < basePoints.length - 1; i += 1) {
        const current = basePoints[i];
        const next = basePoints[i + 1];
        chartPoints.push(current);

        const segmentMilestones = expenseMilestones.filter(
          (m) =>
            remainingIds.has(m.id) &&
            m.age >= current.age &&
            m.age <= next.age,
        );

        for (const m of segmentMilestones) {
          remainingIds.delete(m.id);
          const detail = getDetail(m.id);
          if (!detail) continue;

          const beforePoint: import("@/types/calculator").SimulationPoint = {
            age: m.age,
            portfolioValue: detail.balanceAtAge,
            contributionsValue: current.contributionsValue,
          };

          const afterPoint: import("@/types/calculator").SimulationPoint = {
            age: m.age,
            portfolioValue: detail.balanceAfter,
            contributionsValue: current.contributionsValue,
          };

          chartPoints.push(beforePoint, afterPoint);
        }
      }

      chartPoints.push(basePoints[basePoints.length - 1]);
    }

    const chartMilestones: ChartMilestone[] = milestones.map((m) => {
      const detail = base.milestoneDetails.get(m.id);
      const yearPoint = base.core.years.find(
        (y) => Math.round(y.age) === Math.round(m.age),
      );
      const portfolioValue =
        detail?.balanceAtAge ?? yearPoint?.endingBalance ?? 0;
      return {
        id: m.id,
        age: m.age,
        title: m.title,
        type: m.type,
        status: detail?.status ?? null,
        portfolioValue,
        balanceAtAge: detail?.balanceAtAge ?? yearPoint?.startingBalance ?? 0,
        balanceAfter: detail?.balanceAfter ?? yearPoint?.endingBalance ?? 0,
        cost: detail?.cost ?? 0,
      };
    });

    return {
      simulation: base,
      chartPoints,
      chartMilestones,
    };
  }, [inputs, milestones, comparisonRange]);

  const recommendation = useMemo(() => {
    if (!simulation?.milestoneDetails || milestones.length === 0) return null;
    const expenseMilestones = milestones.filter((m) => m.amount < 0);
    if (expenseMilestones.length === 0) return null;
    const allFundable = expenseMilestones.every(
      (m) => simulation.milestoneDetails.get(m.id)?.status === "finanzierbar",
    );
    if (allFundable) return null;
    const recommended = getRecommendedMonthlyRate(inputs, milestones);
    if (recommended == null) return null;
    return {
      recommendedMonthly: recommended,
      deltaFromCurrent: recommended - inputs.monthlyContribution,
    };
  }, [simulation, inputs, milestones]);

  // Mobile Step-Flow in Browser-History integrieren, damit der Zurück-Button von Schritt 2 zu Schritt 1 führt.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      if (window.innerWidth >= 1024) return;
      const stateStep = (event.state?.mobileStep ?? 1) as 1 | 2;
      if (stateStep === 2) {
        setMobileStep(2);
      } else {
        setMobileStep(1);
        setIsConsultationOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!showMobilePlanStep) return;
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [inputs, milestones, showMobilePlanStep]);

  useEffect(() => {
    if (!showMobilePlanStep) return;
    const el = heroRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [showMobilePlanStep]);

  useEffect(() => {
    if (!isConsultationOpen) return;
    if (typeof window === "undefined") return;
    const el = document.getElementById("plan-besprechen");
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isConsultationOpen]);

  const scrollHeroSoft = () => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;
    const el = heroRef.current;
    if (!el) return;

    if (heroScrollTimeoutRef.current != null) {
      window.clearTimeout(heroScrollTimeoutRef.current);
    }
    heroScrollTimeoutRef.current = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  const handleMobileInputsChange = (next: CalculatorInputs) => {
    setInputs(next);
  };

  const handleMobileInputsChangeAndScroll = (next: CalculatorInputs) => {
    setInputs(next);
    scrollHeroSoft();
  };

  const handleMobileCtaClick = () => {
    setBaselineScenario({
      monthly: inputs.monthlyContribution,
      endValue: simulation?.core?.finalBalance ?? 0,
    });
    if (typeof window !== "undefined") {
      const url = window.location.href;
      // Schritt 2 als eigenen History-Eintrag setzen.
      window.history.pushState({ mobileStep: 2 }, "", url);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileStep(2);
  };

  const handleMobileTopBackClick = () => {
    if (typeof window === "undefined") return;
    if (window.history.length <= 1) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("screen", "intro");
      router.replace(`${pathname}?${next.toString()}`);
      return;
    }
    router.back();
  };

  const handleMobileStep3BackClick = () => {
    if (typeof window === "undefined") return;
    if (window.history.length <= 1) {
      setMobileStep(1);
      setIsConsultationOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.back();
  };

  const handleConsultationCtaClick = () => {
    try {
      const token = trackingTokenRef.current;
      if (token) {
        void trackEvent(token, "booking_clicked");
      }
    } catch {
      // fail silently
    }
    setIsConsultationOpen(true);
  };

  const handleDesktopBackToIntro = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("screen", "intro");
    router.push(`${pathname}?${next.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const handleDesktopBackToConfig = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("screen", "calculator");
    router.push(`${pathname}?${next.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const handleDesktopLifeStepsCtaClick = () => {
    setBaselineScenario({
      monthly: inputs.monthlyContribution,
      endValue: simulation?.core?.finalBalance ?? 0,
    });
    const next = new URLSearchParams(searchParams.toString());
    next.set("screen", "plan");
    router.push(`${pathname}?${next.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    try {
      const token = searchParams.get("t");
      if (!token) return;
      trackingTokenRef.current = token;
      void trackEvent(token, "plan_started");
    } catch {
      // fail silently
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      if (hasTrackedResultRef.current) return;
      const token = trackingTokenRef.current;
      if (!token) return;
      const projectedValue = simulation?.core?.finalBalance;
      if (projectedValue == null) return;
      if (isIntroScreen) return;

      hasTrackedResultRef.current = true;
      void trackEvent(token, "result_viewed", {
        projectedValue,
        childAge: inputs.childAge,
        monthlyRate: inputs.monthlyContribution,
      });
    } catch {
      // fail silently
    }
  }, [simulation, isIntroScreen, inputs.childAge, inputs.monthlyContribution]);

  useEffect(() => {
    if (isIntroScreen) return;
    if (mobileStep !== 1) return;
    if (!shouldScrollToBaseInputsRef.current) return;

    const el = document.getElementById("mobile-base-inputs-start");
    shouldScrollToBaseInputsRef.current = false;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isIntroScreen, mobileStep]);

  const handleIntroStart = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("screen", "calculator");
    shouldScrollToBaseInputsRef.current = true;
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleDesktopIntroStart = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("screen", "calculator");
    router.push(`${pathname}?${next.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFA]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        {/* Header: auf Mobile nur im Intro-Screen (Seite 1), ab Rechner-Screen eigener Header */}
        <div className="lg:hidden">{isIntroScreen && <CalculatorHeader />}</div>
        <div className="hidden lg:block">
          <CalculatorHeader />
        </div>
        {/* HeroIntro: auf Mobile eigener Screen (showIntro), auf Desktop immer sichtbar */}
        <div className="lg:hidden">
          {isIntroScreen && (
            <HeroIntro onStart={handleIntroStart} />
          )}
        </div>
        <div className="hidden lg:block">
          {isIntroScreen && (
            <HeroIntro onStart={handleDesktopIntroStart} />
          )}
        </div>

        {/* Mobile Flow: Seite 1 (Intro) -> Seite 2 (Rechner) -> Seite 3 (Lebensschritte) */}
        <div className="-mt-1 space-y-3 lg:hidden">
          {!isIntroScreen && !showMobilePlanStep && (
            <>
              {/* Oberer Header (Back + Brand) bleibt bestehen */}
              <div className="relative flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleMobileTopBackClick}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition-colors hover:bg-white"
                  aria-label="Zurück"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/70">
                    4futurefamily
                  </span>
                </div>

                <div className="h-10 w-10" aria-hidden="true" />
              </div>

              <div id="mobile-base-inputs-start" className="scroll-mt-4">
                <MobileInputStep
                  value={inputs}
                  onChange={handleMobileInputsChangeAndScroll}
                  onSliderChange={handleMobileInputsChange}
                  onSliderCommit={handleMobileInputsChangeAndScroll}
                />
              </div>

              {/* Neuer Hero (Future Plan Overview) kommt nach den Eingaben */}
              <div ref={heroRef} className="space-y-4 pt-2">
                <div className="space-y-2 pt-1">
                  <h2 className="text-center text-[26px] font-semibold leading-[1.08] tracking-tight text-slate-900">
                    Dein Plan für die Zukunft
                  </h2>

                  <div className="flex justify-center">
                    <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50/70 px-3 py-1 text-[12px] font-semibold text-emerald-800/80 shadow-[0_10px_22px_-18px_rgba(2,44,30,0.35)]">
                      {formatCurrency(inputs.monthlyContribution)} / Monat
                    </span>
                  </div>
                </div>

                <HeroResultLight
                  inputs={inputs}
                  simulation={simulation?.core ?? null}
                  hasMilestones={milestones.length > 0}
                />

                <button
                  type="button"
                  onClick={handleMobileCtaClick}
                  className="w-full rounded-full bg-[#86BFA8] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_36px_-24px_rgba(2,44,30,0.55)] transition-colors hover:bg-[#78B59C] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                >
                  Lebensschritte planen
                </button>

                <p className="text-center text-[12px] font-medium text-slate-500">
                  Passen Sie Ihre Parameter jederzeit an.
                </p>
              </div>
            </>
          )}

          {showMobilePlanStep && (
            <>
              {/* Header: identisch zu Seite 2 (Mobile) */}
              <div className="relative flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleMobileStep3BackClick}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition-colors hover:bg-white"
                  aria-label="Zurück"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/70">
                    4futurefamily
                  </span>
                </div>

                <div className="h-10 w-10" aria-hidden="true" />
              </div>

              <MobileResultStep
                simulation={simulation}
                points={chartPoints}
                chartMilestones={chartMilestones}
                comparisonRange={comparisonRange}
                onRangeChange={setComparisonRange}
                baseMonthly={inputs.monthlyContribution}
                milestones={milestones}
                onAddMilestone={() => {
                  const nextAge =
                    (milestones[milestones.length - 1]?.age ??
                      inputs.childAge + 1) as number;
                  setMilestoneMode("create");
                  setEditingMilestone({
                    id: `m-${Date.now()}`,
                    title: "",
                    age: nextAge,
                    amount: 0,
                    type: "expense",
                    description: "",
                  });
                }}
                onEditMilestone={(milestone) => {
                  setMilestoneMode("edit");
                  setEditingMilestone(milestone);
                }}
                onDeleteMilestone={(id) => {
                  setMilestones((prev) => prev.filter((m) => m.id !== id));
                }}
                recommendation={recommendation}
                onApplyRecommended={(amount) => {
                  setInputs((prev) => ({
                    ...prev,
                    monthlyContribution: amount,
                  }));
                  setBaselineScenario(null);
                }}
                onAddFromTemplate={(template: MilestoneTemplate) => {
                  setMilestoneMode("create");
                  setEditingMilestone({
                    id: `m-${Date.now()}`,
                    title: template.title,
                    age: template.defaultAge,
                    amount: template.defaultAmount,
                    type: "expense",
                    description: `Typische Kosten: ${template.costLabel}`,
                  });
                }}
                onBack={() => setMobileStep(1)}
                onSelectScenarioAmount={(amount) =>
                  setInputs((prev) => ({
                    ...prev,
                    monthlyContribution: amount,
                  }))
                }
              />

              {/* Abschluss-Summary und finaler CTA nur auf Seite 2 (mobil) */}
              <PlanSummarySection
                onConsultationClick={handleConsultationCtaClick}
              />

              {/* Disclaimer direkt unter dem CTA (Seite 2, mobil) */}
              <div className="typo-a4 border-t border-slate-200 pt-4 text-slate-500">
                <p className="max-w-4xl">
                  * Berechnet mit einer angenommenen Rendite von{" "}
                  {formatPercent(inputs.expectedReturnPercentPerYear)} p.&nbsp;a.
                  Die Berechnungen sind modellhaft und dienen ausschließlich der
                  Veranschaulichung möglicher Wertentwicklungen. Renditen sind
                  nicht garantiert, tatsächliche Wertverläufe können von den
                  Annahmen abweichen. Steuern, Kosten und individuelle
                  Vertragsbedingungen werden nicht berücksichtigt. Die
                  Ergebnisse stellen keine Finanz-, Anlage-, Steuer- oder
                  Rechtsberatung dar und können eine persönliche Beratung nicht
                  ersetzen.
                </p>
              </div>

              {/* Beratungssektion erst nach CTA-Klick sichtbar (komplett unsichtbar im Standardzustand) */}
              {isConsultationOpen && (
                <PlanBesprechenSection bookingUrl={bookingUrlOverride} />
              )}
            </>
          )}
        </div>

        {/* Desktop: Seite 2 (Konfiguration) oder Seite 3 (Lebensschritte & Ergebnis) */}
        <div
          className={`hidden flex-col lg:flex ${
            isDesktopPlanScreen ? "gap-3" : "gap-6"
          }`}
        >
          {!isIntroScreen && (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={
                    isDesktopPlanScreen
                      ? handleDesktopBackToConfig
                      : handleDesktopBackToIntro
                  }
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <span aria-hidden="true">←</span>
                  Zurück
                </button>
                <div />
              </div>

              {isDesktopPlanScreen ? (
                <>
                  <div className="relative">
                    <div
                      className={
                        hasAccessToken
                          ? "space-y-6"
                          : "pointer-events-none space-y-6 [filter:blur(8px)]"
                      }
                    >
                      <HeroResultLight
                        inputs={inputs}
                        simulation={simulation?.core ?? null}
                        hasMilestones={milestones.length > 0}
                        containerClassName="mx-auto w-full max-w-none"
                        valueClassName="text-[64px] leading-[1.02] font-bold"
                        titleClassName="text-[14px]"
                        noteClassName="text-[16px]"
                        cardClassName="px-12 py-12"
                        statsLabelClassName="text-[14px]"
                        statsValueClassName="text-[20px] font-bold"
                        statsGridClassName="mt-6 pt-6 gap-6"
                        centered
                        contentGapClassName="space-y-6"
                      />

                      <MobileResultStep
                        simulation={simulation}
                        points={chartPoints}
                        chartMilestones={chartMilestones}
                        comparisonRange={comparisonRange}
                        onRangeChange={setComparisonRange}
                        baseMonthly={inputs.monthlyContribution}
                        milestones={milestones}
                        onAddMilestone={() => {
                          const nextAge =
                            (milestones[milestones.length - 1]?.age ??
                              inputs.childAge + 1) as number;
                          setMilestoneMode("create");
                          setEditingMilestone({
                            id: `m-${Date.now()}`,
                            title: "",
                            age: nextAge,
                            amount: 0,
                            type: "expense",
                            description: "",
                          });
                        }}
                        onEditMilestone={(milestone) => {
                          setMilestoneMode("edit");
                          setEditingMilestone(milestone);
                        }}
                        onDeleteMilestone={(id) => {
                          setMilestones((prev) => prev.filter((m) => m.id !== id));
                        }}
                        recommendation={recommendation}
                        onApplyRecommended={(amount) => {
                          setInputs((prev) => ({
                            ...prev,
                            monthlyContribution: amount,
                          }));
                          setBaselineScenario(null);
                        }}
                        onAddFromTemplate={(template: MilestoneTemplate) => {
                          setMilestoneMode("create");
                          setEditingMilestone({
                            id: `m-${Date.now()}`,
                            title: template.title,
                            age: template.defaultAge,
                            amount: template.defaultAmount,
                            type: "expense",
                            description: `Typische Kosten: ${template.costLabel}`,
                          });
                        }}
                        onBack={handleDesktopBackToConfig}
                        onSelectScenarioAmount={(amount) =>
                          setInputs((prev) => ({
                            ...prev,
                            monthlyContribution: amount,
                          }))
                        }
                        desktopPlanSplit
                      />
                    </div>
                    {!hasAccessToken ? (
                      <DesktopResultGateOverlay accessUrl={pinguinAccessUrl} />
                    ) : null}
                  </div>

                  <PlanSummarySection
                    onConsultationClick={handleConsultationCtaClick}
                  />
                  {isConsultationOpen && (
                    <PlanBesprechenSection bookingUrl={bookingUrlOverride} />
                  )}

                </>
              ) : (
                <>
                  <section className="grid gap-5 lg:grid-cols-[minmax(0,50fr)_minmax(0,50fr)] lg:items-start">
                    <div id="desktop-base-inputs-start">
                      <MobileInputStep
                        value={inputs}
                        onChange={setInputs}
                        onSliderChange={setInputs}
                        onSliderCommit={setInputs}
                        childAgeMax={17}
                        targetAgeMin={18}
                        targetAgeMax={67}
                        layout="desktopStacked"
                      />
                    </div>

                    <div className="relative flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start lg:pt-8">
                      <div
                        className={
                          hasAccessToken
                            ? "flex flex-col gap-4"
                            : "pointer-events-none flex flex-col gap-4 [filter:blur(8px)]"
                        }
                      >
                        <div className="space-y-3">
                          <h2 className="text-center text-[30px] font-semibold leading-[1.08] tracking-tight text-slate-900">
                            Dein Plan für die Zukunft
                          </h2>
                        </div>
                        <div className="flex justify-center">
                          <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50/70 px-5 py-2 text-[18px] font-semibold text-emerald-800/80 shadow-[0_10px_22px_-18px_rgba(2,44,30,0.35)]">
                            {formatCurrency(inputs.monthlyContribution)} / Monat
                          </span>
                        </div>
                        <p className="mx-auto max-w-[400px] pb-4 text-center text-[17px] font-normal leading-relaxed text-slate-600">
                          Mit {formatCurrency(inputs.monthlyContribution)} im Monat
                          kannst du deinem Kind ein Vermögen von{" "}
                          {formatCurrency(simulation?.core?.finalBalance ?? 0)}{" "}
                          bis zum Alter von {Math.round(inputs.targetAge)} Jahren
                          ermöglichen
                          {milestones.length === 0
                            ? " – noch ohne geplante Lebensschritte."
                            : " – unter Berücksichtigung deiner geplanten Lebensschritte."}
                        </p>
                        <div className="w-full [&>section]:mx-0 [&>section]:max-w-none">
                          <HeroResultLight
                            inputs={inputs}
                            simulation={simulation?.core ?? null}
                            hasMilestones={milestones.length > 0}
                            valueClassName="text-[64px] leading-[1.02] font-bold"
                            titleClassName="text-[14px]"
                            noteClassName="text-[16px]"
                            cardClassName="px-12 py-12"
                            statsLabelClassName="text-[14px]"
                            statsValueClassName="text-[20px] font-bold"
                            statsGridClassName="mt-6 pt-6 gap-6"
                            centered
                            contentGapClassName="space-y-6"
                          />
                        </div>
                      </div>
                      {!hasAccessToken ? (
                        <DesktopResultGateOverlay accessUrl={pinguinAccessUrl} />
                      ) : null}
                    </div>
                  </section>

                  <div className="mx-auto mt-4 flex w-full max-w-[480px] justify-center px-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasAccessToken) {
                          window.location.assign(pinguinAccessUrl);
                          return;
                        }
                        handleDesktopLifeStepsCtaClick();
                      }}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#86BFA8] px-10 py-5 text-[20px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(2,44,30,0.55)] transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                    >
                      Lebensschritte planen
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <footer
          className={`typo-a4 mt-4 border-t border-slate-200 pt-4 text-slate-500 ${
            showMobilePlanStep || isIntroScreen ? "hidden lg:block" : ""
          }`}
        >
          <p className="max-w-4xl">
            * Berechnet mit einer angenommenen Rendite von{" "}
            {formatPercent(inputs.expectedReturnPercentPerYear)} p.&nbsp;a. Die
            Berechnungen sind modellhaft und dienen ausschließlich der
            Veranschaulichung möglicher Wertentwicklungen. Renditen sind nicht
            garantiert, tatsächliche Wertverläufe können von den Annahmen
            abweichen. Steuern, Kosten und individuelle Vertragsbedingungen
            werden nicht berücksichtigt. Die Ergebnisse stellen keine
            Finanz-, Anlage-, Steuer- oder Rechtsberatung dar und können eine
            persönliche Beratung nicht ersetzen.
          </p>
        </footer>
      </main>
      <MilestoneForm
        initial={editingMilestone}
        mode={milestoneMode}
        onSubmit={(milestone) => {
          setMilestones((prev) => {
            if (milestoneMode === "create") {
              return [...prev, milestone];
            }
            return prev.map((m) => (m.id === milestone.id ? milestone : m));
          });
          setEditingMilestone(null);
          if (typeof window !== "undefined") {
            const el = document.getElementById("child-life-timeline");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }}
        onDelete={(id) => {
          setMilestones((prev) => prev.filter((m) => m.id !== id));
          setEditingMilestone(null);
        }}
        onClose={() => setEditingMilestone(null)}
      />
      <SavePlanModal
        open={saveModalOpen}
        inputs={inputs}
        milestones={milestones}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
}


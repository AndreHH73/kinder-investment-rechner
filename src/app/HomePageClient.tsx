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
import {
  VariableSparraten,
  type VariableSparratenChangePayload,
} from "@/components/calculator/VariableSparraten";
import { defaultInputs } from "@/data/defaultMilestones";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  buildSimulationPoints,
  computeMilestoneDetails,
  getRecommendedMonthlyRate,
  type RecommendationSet,
  runSimulationWithPhases,
} from "@/lib/simulation";
import type {
  ChartMilestone,
  CalculatorInputs,
  CalculatorSimulationResult,
  Milestone,
  SparPhase,
} from "@/types/calculator";

export default function HomePageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [cashflowEvents, setCashflowEvents] = useState<
    Array<{ age: number; amount: number; label?: string }>
  >([]);
  const [variableRatesPayload, setVariableRatesPayload] =
    useState<VariableSparratenChangePayload | null>(null);
  const [baselineScenario, setBaselineScenario] = useState<{
    monthly: number;
    endValue: number;
  } | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isVariableRatesOpen, setIsVariableRatesOpen] = useState(false);

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

  const {
    simulation,
    chartPoints,
    chartMilestones,
  }: {
    simulation: CalculatorSimulationResult | null;
    chartPoints: import("@/types/calculator").SimulationPoint[];
    chartMilestones: ChartMilestone[];
  } = useMemo(() => {
    const lastPlanYear = Math.max(0, inputs.targetAge - inputs.childAge);
    const fallbackPhases: SparPhase[] = [
      { vonJahr: 0, bisJahr: lastPlanYear, sparrate: inputs.monthlyContribution },
    ];
    const phases = (variableRatesPayload?.phases ?? fallbackPhases).map((p) => ({ ...p }));
    const core = runSimulationWithPhases(
      {
        childCurrentAge: inputs.childAge,
        targetAge: inputs.targetAge,
        initialLumpSum: inputs.initialLumpSum,
        phases,
        annualReturnPercent: inputs.expectedReturnPercentPerYear,
        contributionsAtMonthStart: true,
      },
      cashflowEvents,
    );
    const points = buildSimulationPoints(core);
    const milestoneDetailsRaw = computeMilestoneDetails(core);
    const milestoneIdsByCashflowEventId = new Map<string, string>();
    cashflowEvents.forEach((event, index) => {
      const milestone = milestones.find(
        (m) => m.age === event.age && m.amount === event.amount,
      );
      if (milestone) {
        milestoneIdsByCashflowEventId.set(`cashflow-${index}`, milestone.id);
      }
    });
    const milestoneDetails = new Map<string, import("@/types/calculator").MilestoneDetail>();
    for (const [eventId, detail] of milestoneDetailsRaw.entries()) {
      const milestoneId = milestoneIdsByCashflowEventId.get(eventId);
      if (milestoneId) {
        milestoneDetails.set(milestoneId, detail);
      }
    }
    const totalMilestoneIncome = milestones
      .filter((m) => m.amount > 0)
      .reduce((sum, m) => sum + m.amount, 0);
    const totalMilestoneExpenses = milestones
      .filter((m) => m.amount < 0)
      .reduce((sum, m) => sum + Math.abs(m.amount), 0);
    const base: CalculatorSimulationResult = {
      core,
      points,
      totalMilestoneIncome,
      totalMilestoneExpenses,
      milestoneDetails,
    };
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
  }, [inputs, milestones, comparisonRange, cashflowEvents, variableRatesPayload]);

  useEffect(() => {
    const nextCashflows = milestones
      .filter((m) => m.amount !== 0)
      .map((m) => ({
        age: m.age,
        amount: m.amount,
        label: m.title,
      }));
    setCashflowEvents(nextCashflows);
  }, [milestones]);

  const recommendation = useMemo<RecommendationSet | null>(() => {
    if (!simulation?.milestoneDetails || milestones.length === 0) return null;
    const ausgabenMilestones = milestones.filter((m) => m.amount < 0);
    if (ausgabenMilestones.length === 0) return null;
    const lastPlanYear = Math.max(0, inputs.targetAge - inputs.childAge);
    const fallbackPhases: SparPhase[] = [
      { vonJahr: 0, bisJahr: lastPlanYear, sparrate: inputs.monthlyContribution },
    ];
    const phases = (variableRatesPayload?.phases ?? fallbackPhases).map((p) => ({ ...p }));
    return getRecommendedMonthlyRate(inputs, milestones, phases);
  }, [simulation, inputs, milestones, variableRatesPayload]);
  const hasRecommendation = Boolean(recommendation?.lines?.length);

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
                recommendation={null}
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
                afterMilestonesSection={
                  <section className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsVariableRatesOpen((prev) => !prev)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-[#86BFA8] px-4 py-3 text-left font-semibold text-white shadow-xl shadow-emerald-900/10 transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#F9FBFA] active:opacity-90"
                    >
                      <span className="w-full text-center">Sparplan flexibel anpassen</span>
                    </button>
                    {isVariableRatesOpen && (
                      <VariableSparraten
                        childCurrentAge={inputs.childAge}
                        targetAge={inputs.targetAge}
                        initialLumpSum={inputs.initialLumpSum}
                        baseMonthlyContribution={inputs.monthlyContribution}
                        annualReturnPercent={inputs.expectedReturnPercentPerYear}
                        onChange={setVariableRatesPayload}
                      />
                    )}
                  </section>
                }
              />
              {hasRecommendation && recommendation && (
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                  <h3 className="mb-2 font-medium">Handlungsempfehlungen</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    {recommendation.lines.map((line, idx) => (
                      <li key={`${idx}-${line}`}>{line}</li>
                    ))}
                  </ul>
                </section>
              )}

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
                    recommendation={null}
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
                    afterMilestonesSection={
                      <section className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setIsVariableRatesOpen((prev) => !prev)}
                          className="flex w-full items-center gap-3 rounded-2xl bg-[#86BFA8] px-4 py-3 text-left font-semibold text-white shadow-xl shadow-emerald-900/10 transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#F9FBFA] active:opacity-90"
                        >
                          <span className="w-full text-center">Sparplan flexibel anpassen</span>
                        </button>
                        {isVariableRatesOpen && (
                          <VariableSparraten
                            childCurrentAge={inputs.childAge}
                            targetAge={inputs.targetAge}
                            initialLumpSum={inputs.initialLumpSum}
                            baseMonthlyContribution={inputs.monthlyContribution}
                            annualReturnPercent={inputs.expectedReturnPercentPerYear}
                            onChange={setVariableRatesPayload}
                          />
                        )}
                        {hasRecommendation && recommendation && (
                          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                            <h3 className="mb-2 font-medium">Handlungsempfehlungen</h3>
                            <ul className="list-disc space-y-1 pl-5">
                              {recommendation.lines.map((line, idx) => (
                                <li key={`${idx}-${line}`}>{line}</li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </section>
                    }
                    desktopPlanSplit
                  />

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
                    <div id="desktop-base-inputs-start" className="space-y-4">
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

                    <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start lg:pt-8">
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
                  </section>

                  <div className="mx-auto mt-4 flex w-full max-w-[480px] justify-center px-1">
                    <button
                      type="button"
                      onClick={handleDesktopLifeStepsCtaClick}
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


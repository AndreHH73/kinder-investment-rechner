import {
  CalculatorInput,
  EventType,
  InvestmentEvent,
  SimulationMonth,
  SimulationResult,
  SimulationYear,
} from "@/types/investment";
import type {
  CalculatorInputs,
  CalculatorSimulationResult,
  Milestone,
  MilestoneDetail,
  SimulationPoint,
  SimulationWithPhasesInput,
  SparPhase,
} from "@/types/calculator";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  "rate-change": "Sparrate ändern",
  "lump-sum": "Einmalzahlung",
  withdrawal: "Entnahme",
  milestone: "Lebensschritt",
};

const MONTHS_PER_YEAR = 12;

function getMonthlyRate(returnPercentPerYear: number): number {
  const yearlyRate = returnPercentPerYear / 100;
  return Math.pow(1 + yearlyRate, 1 / MONTHS_PER_YEAR) - 1;
}

function sortEvents(events: InvestmentEvent[]): InvestmentEvent[] {
  return [...events].sort((a, b) => {
    if (a.age === b.age) {
      const order: EventType[] = [
        "rate-change",
        "lump-sum",
        "withdrawal",
        "milestone",
      ];
      return order.indexOf(a.type) - order.indexOf(b.type);
    }
    return a.age - b.age;
  });
}

function getEventLabel(event: InvestmentEvent): string {
  const maybeDescription =
    (event as { description?: string }).description ?? "";
  const trimmed = maybeDescription.trim();
  return trimmed.length > 0 ? trimmed : event.id;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateInput(
  input: CalculatorInput,
  events: InvestmentEvent[],
): ValidationResult {
  const errors: string[] = [];

  if (input.childCurrentAge < 0 || input.childCurrentAge > 100) {
    errors.push("Aktuelles Alter muss zwischen 0 und 100 Jahren liegen.");
  }

  if (input.targetAge <= input.childCurrentAge) {
    errors.push("Zielalter muss größer als das aktuelle Alter sein.");
  }

  if (input.initialMonthlyContribution < 0) {
    errors.push("Monatliche Sparrate darf nicht negativ sein.");
  }

  if (input.initialLumpSum < 0) {
    errors.push("Startkapital darf nicht negativ sein.");
  }

  if (input.expectedReturnPercentPerYear < -50) {
    errors.push("Rendite p.a. ist zu niedrig (unter -50 %).");
  }

  if (input.expectedReturnPercentPerYear > 20) {
    errors.push("Rendite p.a. ist sehr hoch (über 20 %) und eher unrealistisch.");
  }

  for (const event of events) {
    if (event.age < input.childCurrentAge || event.age > input.targetAge) {
      errors.push(
        `Lebensschritt "${getEventLabel(event)}" liegt außerhalb des gewählten Altersbereichs.`,
      );
    }
    if (event.type !== "milestone" && event.amount <= 0) {
      errors.push(
        `Lebensschritt "${getEventLabel(event)}" muss einen positiven Betrag haben.`,
      );
    }
    if (event.type === "milestone" && event.amount !== 0) {
      errors.push(
        `Lebensschritt "${getEventLabel(event)}" darf keinen Betrag haben.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** Monatliche Sparrate für das Laufzeitjahr j (0 = erstes Jahr); erste passende Phase gewinnt. */
function getSparrateForPlanYear(phases: SparPhase[], planYear: number): number {
  for (const phase of phases) {
    if (planYear >= phase.vonJahr && planYear <= phase.bisJahr) {
      return phase.sparrate;
    }
  }
  return 0;
}

/**
 * Erzeugt rate-change-Events so, dass ab dem ersten Monat des Laufzeitjahres y die Rate für y gilt
 * (Wechsel liegt auf dem letzten Monat von y−1, damit runSimulation die neue Rate ab Monat y*12 nutzt).
 */
function buildPhaseRateChangeEvents(
  childCurrentAge: number,
  lastPlanYear: number,
  phases: SparPhase[],
): InvestmentEvent[] {
  const events: InvestmentEvent[] = [];
  let previousRate = getSparrateForPlanYear(phases, 0);

  for (let y = 1; y <= lastPlanYear; y += 1) {
    const rateThisYear = getSparrateForPlanYear(phases, y);
    if (rateThisYear !== previousRate) {
      const monthIndex = y * MONTHS_PER_YEAR - 1;
      const age = childCurrentAge + monthIndex / MONTHS_PER_YEAR;
      events.push({
        id: `sparphase-wechsel-nach-laufzeitjahr-${y - 1}`,
        type: "rate-change",
        age,
        amount: rateThisYear,
      });
      previousRate = rateThisYear;
    }
  }

  return events;
}

/**
 * Wie runSimulation, aber monatliche Sparrate aus Phasen (Laufzeitjahr = floor(monthIndex / 12)).
 * Verzinsung: annualReturnPercent (Fallback 6 % p.a.). Nutzt intern runSimulation + synthetische rate-change-Events.
 *
 * Optional: cashflowEvents – positiver amount = Einzahlung (lump-sum), negativ = Entnahme (withdrawal).
 */
export function runSimulationWithPhases(
  input: SimulationWithPhasesInput,
  cashflowEvents?: Array<{ age: number; amount: number; label?: string }>,
): SimulationResult {
  const contributionsAtMonthStart = input.contributionsAtMonthStart ?? true;
  const annualReturnPercent = input.annualReturnPercent ?? 6;

  // Gleiche Monatsanzahl wie runSimulation → letztes Laufzeitjahr = floor(totalMonths / 12)
  const totalMonths =
    (input.targetAge - input.childCurrentAge) * MONTHS_PER_YEAR;
  const lastPlanYear = Math.max(0, Math.floor(totalMonths / MONTHS_PER_YEAR));

  const initialRate = getSparrateForPlanYear(input.phases, 0);
  const syntheticEvents = buildPhaseRateChangeEvents(
    input.childCurrentAge,
    lastPlanYear,
    input.phases,
  );

  const mappedCashflowEvents: InvestmentEvent[] = (cashflowEvents ?? [])
    .filter((e) => e.amount !== 0)
    .filter((e) => e.age <= input.targetAge)
    .map((e, index) => ({
      id: `cashflow-${index}`,
      age: e.age,
      type: e.amount > 0 ? ("lump-sum" as const) : ("withdrawal" as const),
      amount: Math.abs(e.amount),
      ...(e.label !== undefined ? { description: e.label } : {}),
    }));

  const mergedEvents = [...syntheticEvents, ...mappedCashflowEvents];

  const calculatorInput: CalculatorInput = {
    childCurrentAge: input.childCurrentAge,
    targetAge: input.targetAge,
    initialMonthlyContribution: initialRate,
    initialLumpSum: input.initialLumpSum,
    expectedReturnPercentPerYear: annualReturnPercent,
    contributionsAtMonthStart,
  };

  return runSimulation(calculatorInput, mergedEvents);
}

export function runSimulation(
  input: CalculatorInput,
  events: InvestmentEvent[],
): SimulationResult {
  const monthlyRate = getMonthlyRate(input.expectedReturnPercentPerYear);
  const sortedEvents = sortEvents(events);

  const totalMonths = (input.targetAge - input.childCurrentAge) * MONTHS_PER_YEAR;

  let currentBalance = input.initialLumpSum;
  let currentMonthlyContribution = input.initialMonthlyContribution;

  const months: SimulationMonth[] = [];

  let totalContributions = 0;
  let totalWithdrawals = 0;
  let totalInterest = 0;

  const eventsByMonthIndex = new Map<number, InvestmentEvent[]>();
  for (const event of sortedEvents) {
    const monthsFromStart =
      (event.age - input.childCurrentAge) * MONTHS_PER_YEAR;
    const monthIndexForEvent = Math.min(
      totalMonths,
      Math.max(0, Math.round(monthsFromStart)),
    );
    const list = eventsByMonthIndex.get(monthIndexForEvent) ?? [];
    list.push(event);
    eventsByMonthIndex.set(monthIndexForEvent, list);
  }

  for (let monthIndex = 0; monthIndex <= totalMonths; monthIndex += 1) {
    const age = input.childCurrentAge + monthIndex / MONTHS_PER_YEAR;
    const yearIndex = Math.floor(age - input.childCurrentAge);
    const absoluteYear = Math.floor(age);
    const monthOfYear = (monthIndex % MONTHS_PER_YEAR) + 1;

    const startingBalance = currentBalance;
    let contributionsThisMonth = 0;
    let withdrawalsThisMonth = 0;
    let interestThisMonth = 0;
    const appliedEvents: InvestmentEvent[] = [];

    const eventsThisMonth = eventsByMonthIndex.get(monthIndex) ?? [];

    const applyEvents = () => {
      for (const event of eventsThisMonth) {
        appliedEvents.push(event);
        if (event.type === "rate-change") {
          currentMonthlyContribution = event.amount;
        } else if (event.type === "lump-sum") {
          currentBalance += event.amount;
          contributionsThisMonth += event.amount;
        } else if (event.type === "withdrawal") {
          const withdrawal = Math.min(event.amount, currentBalance);
          currentBalance -= withdrawal;
          withdrawalsThisMonth += withdrawal;
        }
      }
    };

    if (input.contributionsAtMonthStart) {
      if (currentMonthlyContribution > 0) {
        currentBalance += currentMonthlyContribution;
        contributionsThisMonth += currentMonthlyContribution;
      }
      applyEvents();
      if (monthlyRate !== 0) {
        interestThisMonth = currentBalance * monthlyRate;
        currentBalance += interestThisMonth;
      }
    } else {
      if (monthlyRate !== 0) {
        interestThisMonth = currentBalance * monthlyRate;
        currentBalance += interestThisMonth;
      }
      if (currentMonthlyContribution > 0) {
        currentBalance += currentMonthlyContribution;
        contributionsThisMonth += currentMonthlyContribution;
      }
      applyEvents();
    }

    totalContributions += contributionsThisMonth;
    totalWithdrawals += withdrawalsThisMonth;
    totalInterest += interestThisMonth;

    months.push({
      monthIndex,
      age,
      year: absoluteYear,
      monthOfYear,
      startingBalance,
      contributions: contributionsThisMonth,
      withdrawals: withdrawalsThisMonth,
      interest: interestThisMonth,
      endingBalance: currentBalance,
      appliedEvents,
    });
  }

  const years: SimulationYear[] = [];
  for (let yearIndex = 0; yearIndex <= input.targetAge - input.childCurrentAge; yearIndex += 1) {
    const age = input.childCurrentAge + yearIndex;
    const yearMonths = months.filter(
      (m) => Math.floor(m.age) === Math.floor(age),
    );

    if (yearMonths.length === 0) {
      continue;
    }

    const startingBalance = yearMonths[0]?.startingBalance ?? 0;
    const endingBalance =
      yearMonths[yearMonths.length - 1]?.endingBalance ?? startingBalance;
    const totalContributionsYear = yearMonths.reduce(
      (sum, m) => sum + m.contributions,
      0,
    );
    const totalWithdrawalsYear = yearMonths.reduce(
      (sum, m) => sum + m.withdrawals,
      0,
    );
    const totalInterestYear = yearMonths.reduce(
      (sum, m) => sum + m.interest,
      0,
    );

    years.push({
      yearIndex,
      age,
      startingBalance,
      totalContributions: totalContributionsYear,
      totalWithdrawals: totalWithdrawalsYear,
      totalInterest: totalInterestYear,
      endingBalance,
    });
  }

  return {
    months,
    years,
    totalContributions,
    totalWithdrawals,
    totalInterest,
    finalBalance: currentBalance,
  };
}

export function buildSimulationPoints(
  result: SimulationResult,
): SimulationPoint[] {
  let cumulativeContributions = 0;
  return result.years.map((year) => {
    cumulativeContributions += year.totalContributions;
    return {
      age: year.age,
      portfolioValue: year.endingBalance,
      contributionsValue: cumulativeContributions,
    };
  });
}

/**
 * Pro Lebensschritt-Event: Vermögen unmittelbar davor und danach (sequenziell).
 */
export function computeMilestoneDetails(
  core: SimulationResult,
): Map<string, MilestoneDetail> {
  const details = new Map<string, MilestoneDetail>();

  for (const month of core.months) {
    let balanceBeforeEvents = month.startingBalance + month.contributions;

    for (const event of month.appliedEvents) {
      if (event.type === "rate-change") continue;

      const balanceAtAge = balanceBeforeEvents;
      let balanceAfter: number;
      const cost = event.amount;
      let shortfall = 0;
      let progressPercent = 100;
      let status: MilestoneDetail["status"] = null;

      if (event.type === "withdrawal") {
        const actualWithdrawal = Math.min(event.amount, balanceBeforeEvents);
        balanceAfter = balanceBeforeEvents - actualWithdrawal;
        shortfall = Math.max(0, event.amount - actualWithdrawal);
        progressPercent = event.amount > 0
          ? Math.min(100, (balanceAtAge / event.amount) * 100)
          : 100;
        if (balanceAtAge >= event.amount) {
          status = "finanzierbar";
        } else if (balanceAtAge > 0) {
          status = "teilweise finanzierbar";
        } else {
          status = "nicht finanzierbar";
        }
      } else {
        balanceAfter = balanceBeforeEvents + event.amount;
      }

      details.set(event.id, {
        balanceAtAge,
        balanceAfter,
        cost,
        shortfall,
        progressPercent,
        status,
      });
      balanceBeforeEvents = balanceAfter;
    }
  }

  return details;
}

export function runCalculatorSimulation(
  inputs: CalculatorInputs,
  milestones: Milestone[],
): CalculatorSimulationResult {
  const filteredMilestones = milestones.filter(
    (m) => m.age >= inputs.childAge && m.age <= inputs.targetAge,
  );

  const baseInput: CalculatorInput = {
    childCurrentAge: inputs.childAge,
    targetAge: inputs.targetAge,
    initialMonthlyContribution: inputs.monthlyContribution,
    initialLumpSum: inputs.initialLumpSum,
    expectedReturnPercentPerYear: inputs.expectedReturnPercentPerYear,
    contributionsAtMonthStart: true,
  };

  const milestoneEvents: InvestmentEvent[] = filteredMilestones
    .filter((m) => m.amount !== 0)
    .map((m) => ({
      id: m.id,
      age: m.age,
      type: m.amount > 0 ? ("lump-sum" as const) : ("withdrawal" as const),
      amount: Math.abs(m.amount),
      description: m.title,
    }));

  const core = runSimulation(baseInput, milestoneEvents);
  const points = buildSimulationPoints(core);
  const milestoneDetails = computeMilestoneDetails(core);

  const totalMilestoneIncome = filteredMilestones
    .filter((m) => m.amount > 0)
    .reduce((sum, m) => sum + m.amount, 0);
  const totalMilestoneExpenses = filteredMilestones
    .filter((m) => m.amount < 0)
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  return {
    core,
    points,
    totalMilestoneIncome,
    totalMilestoneExpenses,
    milestoneDetails,
  };
}

const RECOMMENDED_RATE_STEP_EUR = 5;
const RECOMMENDED_BASE_RATE_MAX_EUR = 500;
const RATE_EQ_EPS = 1e-6;

type FundingStatus = "finanziert" | "teilweise" | "nicht finanzierbar";
type EventFundingEvaluation = {
  id: string;
  title: string;
  age: number;
  amount: number;
  status: FundingStatus;
  /** Aus computeMilestoneDetails: fehlender Betrag bei Entnahme (0 wenn finanziert). */
  shortfall: number;
};

function clonePhases(phases: ReadonlyArray<SparPhase>): SparPhase[] {
  return phases.map((p) => ({
    vonJahr: Number(p.vonJahr),
    bisJahr: Number(p.bisJahr),
    sparrate: Number(p.sparrate),
  }));
}

/**
 * Basis-Sparrate im Slider ersetzen: nur Segmente, die zur „eingebetteten“ Basisrate gehören,
 * auf baseNew setzen; Ausnahmen (andere Beträge) bleiben.
 * Vergleich numerisch (Number + Toleranz), damit string/float aus UI/JSON nicht scheitert.
 */
function phasesWithReplacedBase(
  phases: ReadonlyArray<SparPhase>,
  baseOld: number,
  baseNew: number,
): SparPhase[] {
  const bo = Number(baseOld);
  const bn = Number(baseNew);
  return phases.map((p) => {
    const r = Number(p.sparrate);
    return {
      ...p,
      vonJahr: Number(p.vonJahr),
      bisJahr: Number(p.bisJahr),
      sparrate: Math.abs(r - bo) < RATE_EQ_EPS ? bn : r,
    };
  });
}

/**
 * Eingebettete Basisrate in den Phasen: meist die im Plan am häufigsten vorkommende Sparrate (in Planjahren),
 * außer 0€-Pause. Wenn der Slider-Wert in den Phasen vorkommt, gilt der Slider.
 * So gleichen wir ab, wenn mergeExceptionsToSparPhases noch eine alte Basis enthält (z. B. 259€) aber
 * inputs.monthlyContribution schon 25€ ist — sonst ersetzt phasesWithReplacedBase nichts und die Suche
 * landet bei viel zu hohen Raten.
 */
function getEmbeddedBaseRate(
  phases: readonly SparPhase[],
  sliderBase: number,
): number {
  const sb = Number(sliderBase);
  let sliderYears = 0;
  const byRate = new Map<number, number>();
  for (const p of phases) {
    const years = Number(p.bisJahr) - Number(p.vonJahr) + 1;
    const r = Number(p.sparrate);
    if (Number.isNaN(r) || years <= 0) continue;
    byRate.set(r, (byRate.get(r) ?? 0) + years);
    if (Math.abs(r - sb) < RATE_EQ_EPS) sliderYears += years;
  }
  if (sliderYears > 0) return sb;
  let best = sb;
  let bestY = -1;
  for (const [r, y] of byRate) {
    if (Math.abs(r) < RATE_EQ_EPS) continue;
    if (y > bestY) {
      bestY = y;
      best = r;
    }
  }
  return best;
}

function alignPhasesToSliderBase(
  phases: ReadonlyArray<SparPhase>,
  sliderBase: number,
): SparPhase[] {
  // Defensiv: niemals mit externen Referenzen arbeiten, nur auf Deep-Copy.
  const cloned = clonePhases(phases);
  const embedded = getEmbeddedBaseRate(phases, sliderBase);
  if (Math.abs(embedded - Number(sliderBase)) < RATE_EQ_EPS) {
    return cloned;
  }
  return phasesWithReplacedBase(cloned, embedded, Number(sliderBase));
}

/** Längstes Präfix chronologisch sortierter Ausgaben, die alle voll finanziert sind. */
function fundedPrefixLength(evaluations: EventFundingEvaluation[]): number {
  let k = 0;
  for (const e of evaluations) {
    if (e.status === "finanziert") k += 1;
    else break;
  }
  return k;
}

export type RecommendationSet = {
  eventEvaluations: EventFundingEvaluation[];
  lines: string[];
  increaseBaseRate?: { recommended: number; delta: number };
  shortenPause?: { recommendedBisAlter: number; yearsToShorten: number };
};

/**
 * Bewertet alle Ausgaben-Lebensschritte sequenziell über die gesamte Timeline
 * und erzeugt maximal 3 ehrliche Handlungsempfehlungen.
 */
export function getRecommendedMonthlyRate(
  inputs: CalculatorInputs,
  milestones: Milestone[],
  phases: SparPhase[],
): RecommendationSet | null {
  const filtered = milestones.filter(
    (m) => m.age >= inputs.childAge && m.age <= inputs.targetAge && m.amount < 0,
  );
  if (filtered.length === 0) return null;

  const cashflowEvents = milestones
    .filter((m) => m.amount !== 0)
    .map((m) => ({
      age: m.age,
      amount: m.amount,
      label: m.title,
    }));
  const expenseEventIdByMilestoneId = new Map<string, string>();
  let cashflowIdx = 0;
  for (const m of milestones) {
    if (m.amount === 0) continue;
    if (m.amount < 0) {
      expenseEventIdByMilestoneId.set(m.id, `cashflow-${cashflowIdx}`);
    }
    cashflowIdx += 1;
  }

  const sliderBase = Number(inputs.monthlyContribution);
  const sourcePhases = clonePhases(phases);
  const workingPhases = alignPhasesToSliderBase(
    sourcePhases,
    sliderBase,
  );

  const evaluateScenario = (
    candidatePhases: SparPhase[],
  ): { allFundable: boolean; evaluations: EventFundingEvaluation[] } => {
    const core = runSimulationWithPhases(
      {
        childCurrentAge: inputs.childAge,
        targetAge: inputs.targetAge,
        initialLumpSum: inputs.initialLumpSum,
        phases: candidatePhases,
        annualReturnPercent: inputs.expectedReturnPercentPerYear,
        contributionsAtMonthStart: true,
      },
      cashflowEvents,
    );
    const details = computeMilestoneDetails(core);
    const evaluations = filtered
      .slice()
      .sort((a, b) => a.age - b.age)
      .map((m): EventFundingEvaluation => {
        const eventId = expenseEventIdByMilestoneId.get(m.id);
        const detail = eventId ? details.get(eventId) : undefined;
        let status: FundingStatus = "nicht finanzierbar";
        if (detail?.status === "finanzierbar") status = "finanziert";
        else if (detail?.status === "teilweise finanzierbar") status = "teilweise";
        return {
          id: m.id,
          title: m.title,
          age: m.age,
          amount: Math.abs(m.amount),
          status,
          shortfall: detail?.shortfall ?? 0,
        };
      });
    return {
      allFundable: evaluations.every((e) => e.status === "finanziert"),
      evaluations,
    };
  };

  const allFundableAt = (candidatePhases: SparPhase[]): boolean =>
    evaluateScenario(candidatePhases).allFundable;

  const baseline = evaluateScenario(workingPhases);
  const recommendations: RecommendationSet = {
    eventEvaluations: baseline.evaluations,
    lines: [],
  };

  if (baseline.allFundable) {
    recommendations.lines.push(
      "Alle Lebensschritte sind mit den aktuellen Einstellungen finanzierbar.",
    );
    return recommendations;
  }

  const fundedCount = baseline.evaluations.filter(
    (e) => e.status === "finanziert",
  ).length;
  const unfunded = baseline.evaluations.filter((e) => e.status !== "finanziert");
  if (fundedCount === 0) {
    recommendations.lines.push("Aktuell ist kein Lebensschritt vollständig finanzierbar.");
  } else {
    const fundedTitles = baseline.evaluations
      .filter((e) => e.status === "finanziert")
      .map((e) => `${e.title} (Alter ${e.age})`)
      .slice(0, 2)
      .join(", ");
    const unfundedTitles = unfunded
      .map((e) => `${e.title} (Alter ${e.age})`)
      .slice(0, 2)
      .join(", ");
    recommendations.lines.push(
      `Finanziert: ${fundedTitles || "kein Ziel"}. Offen: ${unfundedTitles || "keins"}.`,
    );
  }

  const toPlanYear = (age: number): number =>
    Math.max(0, Math.floor(age - inputs.childAge));
  const findPhaseAtAge = (age: number): SparPhase | undefined => {
    const y = toPlanYear(age);
    return workingPhases.find((p) => y >= p.vonJahr && y <= p.bisJahr);
  };
  const isBlockedByZeroException = (age: number): boolean => {
    const phase = findPhaseAtAge(age);
    if (!phase || phase.sparrate !== 0) return false;
    // Eine Basis-Erhöhung wirkt vor dem Event nicht, wenn die 0€-Ausnahmephase ab Start bis zum Event reicht.
    return phase.vonJahr === 0 && phase.bisJahr >= toPlanYear(age);
  };
  const blockedEvents = unfunded.filter((e) => isBlockedByZeroException(e.age));
  const skipBaseRateRecommendation = blockedEvents.length > 0;

  // 1) Mindest-Basisrate suchen, bei der SIMULATION + computeMilestoneDetails ALLE Ausgaben als "finanzierbar" melden.
  // Wichtig: Basis nur in Segmenten ersetzen, die der aktuellen Basisrate entsprechen — nicht p.sparrate+delta auf alle Phasen,
  // sonst würden 0€-Pausen künstlich angehoben und die Suche würde zu früh stoppen (z. B. "65€ reicht für alle" obwohl nur Event 1 passt).
  const baseRateMax = Math.max(RECOMMENDED_BASE_RATE_MAX_EUR, sliderBase);
  if (!skipBaseRateRecommendation && sliderBase <= baseRateMax) {
    for (
      let r = sliderBase + RECOMMENDED_RATE_STEP_EUR;
      r <= baseRateMax;
      r += RECOMMENDED_RATE_STEP_EUR
    ) {
      const candidatePhases = phasesWithReplacedBase(workingPhases, sliderBase, r);
      if (allFundableAt(candidatePhases)) {
        recommendations.increaseBaseRate = {
          recommended: r,
          delta: r - sliderBase,
        };
        break;
      }
    }
  }

  // Keine Basisrate bis Cap, die alle Events finanziert: Rate wählen, die das längste finanzierte Präfix (ab frühestem Event) maximiert.
  let bestPartial: {
    rate: number;
    evaluations: EventFundingEvaluation[];
    prefix: number;
  } | null = null;
  if (!skipBaseRateRecommendation && !recommendations.increaseBaseRate) {
    for (
      let r = sliderBase;
      r <= baseRateMax;
      r += RECOMMENDED_RATE_STEP_EUR
    ) {
      const ev = evaluateScenario(
        phasesWithReplacedBase(workingPhases, sliderBase, r),
      );
      const prefix = fundedPrefixLength(ev.evaluations);
      if (
        !bestPartial ||
        prefix > bestPartial.prefix ||
        (prefix === bestPartial.prefix && r < bestPartial.rate)
      ) {
        bestPartial = { rate: r, evaluations: ev.evaluations, prefix };
      }
    }
  }

  // 2) Längste Ausnahmephase jährlich verkürzen.
  const exceptionIndices = workingPhases
    .map((p, idx) => ({ p, idx }))
    .filter(
      ({ p }) => Math.abs(Number(p.sparrate) - sliderBase) > RATE_EQ_EPS,
    );
  const longestException = exceptionIndices.reduce<
    { p: SparPhase; idx: number } | null
  >((acc, cur) => {
    if (!acc) return cur;
    const accLen = acc.p.bisJahr - acc.p.vonJahr;
    const curLen = cur.p.bisJahr - cur.p.vonJahr;
    return curLen > accLen ? cur : acc;
  }, null);
  if (longestException) {
    let candidateBis = longestException.p.bisJahr;
    while (candidateBis > longestException.p.vonJahr + 1) {
      candidateBis -= 1;
      const candidatePhases = clonePhases(workingPhases).map((p, idx) =>
        idx === longestException.idx ? { ...p, bisJahr: candidateBis } : p,
      );
      const nextIdx = longestException.idx + 1;
      if (nextIdx < candidatePhases.length) {
        const next = candidatePhases[nextIdx]!;
        candidatePhases[nextIdx] = {
          ...next,
          vonJahr: Math.min(next.bisJahr, candidateBis + 1),
        };
      }
      if (allFundableAt(candidatePhases)) {
        recommendations.shortenPause = {
          recommendedBisAlter: inputs.childAge + candidateBis,
          yearsToShorten: longestException.p.bisJahr - candidateBis,
        };
        break;
      }
    }
  }

  if (blockedEvents.length > 0) {
    const firstBlocked = blockedEvents[0]!;
    recommendations.lines.push(
      `${firstBlocked.title} (Alter ${firstBlocked.age}) liegt in einer 0€-Ausnahmephase; Basis-Sparrate hilft hier nicht.`,
    );
  } else if (recommendations.increaseBaseRate) {
    recommendations.lines.push(
      `Basis-Sparrate auf ${recommendations.increaseBaseRate.recommended}€ erhöhen, um alle offenen Ziele zu finanzieren.`,
    );
  } else if (bestPartial) {
    const parts = bestPartial.evaluations.map((e) =>
      e.status === "finanziert"
        ? `${e.title} ✓`
        : `${e.title} ✗ (fehlen ${Math.round(e.shortfall)}€)`,
    );
    recommendations.lines.push(
      `Mit ${bestPartial.rate}€/Monat: ${parts.join(", ")}.`,
    );
  } else {
    recommendations.lines.push(
      `Mit einer Basis-Sparrate bis ${baseRateMax}€ sind nicht alle offenen Ziele finanzierbar.`,
    );
  }

  if (recommendations.shortenPause) {
    recommendations.lines.push(
      `Pause verkürzen: Bis-Alter auf ${recommendations.shortenPause.recommendedBisAlter} setzen (−${recommendations.shortenPause.yearsToShorten} Jahr(e)).`,
    );
  } else if (blockedEvents.length > 0) {
    recommendations.lines.push(
      "Mindestens ein offenes Ziel liegt in der Pause; dafür ist eine kürzere Ausnahmephase nötig.",
    );
  }

  recommendations.lines = recommendations.lines.slice(0, 3);
  return recommendations;
}



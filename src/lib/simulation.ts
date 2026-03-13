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
  SimulationPoint,
} from "@/types/calculator";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  "rate-change": "Sparrate ändern",
  "lump-sum": "Einmalzahlung",
  withdrawal: "Entnahme",
  milestone: "Meilenstein",
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
        `Ereignis "${getEventLabel(event)}" liegt außerhalb des gewählten Altersbereichs.`,
      );
    }
    if (event.type !== "milestone" && event.amount <= 0) {
      errors.push(
        `Ereignis "${getEventLabel(event)}" muss einen positiven Betrag haben.`,
      );
    }
    if (event.type === "milestone" && event.amount !== 0) {
      errors.push(
        `Meilenstein "${getEventLabel(event)}" darf keinen Betrag haben.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
  };
}



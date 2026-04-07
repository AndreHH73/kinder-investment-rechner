import type { SimulationResult } from "@/types/investment";

/** Eine Sparphase: Laufzeitjahre inkl. Grenzen (0 = erstes Jahr ab Start), monatliche Rate in €. */
export type SparPhase = {
  vonJahr: number;
  bisJahr: number;
  sparrate: number;
};

/** Eingabe für Simulation mit Phasen-Raten; Rendite standardmäßig 6 % p.a., falls nicht gesetzt. */
export interface SimulationWithPhasesInput {
  childCurrentAge: number;
  targetAge: number;
  initialLumpSum: number;
  phases: SparPhase[];
  annualReturnPercent?: number;
  /** Entspricht runCalculatorSimulation / Standard true */
  contributionsAtMonthStart?: boolean;
}

export interface CalculatorInputs {
  monthlyContribution: number;
  childAge: number;
  targetAge: number;
  expectedReturnPercentPerYear: number;
  initialLumpSum: number;
}

export type MilestoneType = "income" | "expense";

export interface Milestone {
  id: string;
  title: string;
  age: number;
  amount: number;
  type: MilestoneType;
  description?: string;
}

export interface SimulationPoint {
  age: number;
  portfolioValue: number;
  contributionsValue: number;
  lowerPortfolioValue?: number;
  higherPortfolioValue?: number;
  lowerContributionsValue?: number;
  higherContributionsValue?: number;
}

export interface MilestoneDetail {
  balanceAtAge: number;
  balanceAfter: number;
  cost: number;
  shortfall: number;
  progressPercent: number;
  status: "finanzierbar" | "teilweise finanzierbar" | "nicht finanzierbar" | null;
}

export interface ChartMilestone {
  id: string;
  age: number;
  title: string;
  type: MilestoneType;
  status: MilestoneDetail["status"];
  portfolioValue: number;
  balanceAtAge: number;
  balanceAfter: number;
  cost: number;
}

export interface CalculatorSimulationResult {
  core: SimulationResult;
  points: SimulationPoint[];
  totalMilestoneIncome: number;
  totalMilestoneExpenses: number;
  milestoneDetails: Map<string, MilestoneDetail>;
}


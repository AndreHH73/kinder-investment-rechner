import type { SimulationResult } from "@/types/investment";

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


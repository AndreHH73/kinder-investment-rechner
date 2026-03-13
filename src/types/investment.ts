export type EventType =
  | "rate-change"
  | "lump-sum"
  | "withdrawal"
  | "milestone";

export interface CalculatorInput {
  childCurrentAge: number;
  targetAge: number;
  initialMonthlyContribution: number;
  initialLumpSum: number;
  expectedReturnPercentPerYear: number;
  contributionsAtMonthStart: boolean;
}

export interface InvestmentEventBase {
  id: string;
  age: number;
  type: EventType;
  amount: number;
  description?: string;
}

export interface RateChangeEvent extends InvestmentEventBase {
  type: "rate-change";
}

export interface LumpSumEvent extends InvestmentEventBase {
  type: "lump-sum";
}

export interface WithdrawalEvent extends InvestmentEventBase {
  type: "withdrawal";
}

export interface MilestoneEvent extends InvestmentEventBase {
  type: "milestone";
  amount: 0;
}

export type InvestmentEvent =
  | RateChangeEvent
  | LumpSumEvent
  | WithdrawalEvent
  | MilestoneEvent;

export interface SimulationMonth {
  monthIndex: number;
  age: number;
  year: number;
  monthOfYear: number;
  startingBalance: number;
  contributions: number;
  withdrawals: number;
  interest: number;
  endingBalance: number;
  appliedEvents: InvestmentEvent[];
}

export interface SimulationYear {
  yearIndex: number;
  age: number;
  startingBalance: number;
  totalContributions: number;
  totalWithdrawals: number;
  totalInterest: number;
  endingBalance: number;
}

export interface SimulationResult {
  months: SimulationMonth[];
  years: SimulationYear[];
  totalContributions: number;
  totalWithdrawals: number;
  totalInterest: number;
  finalBalance: number;
}


import type { CalculatorInputs, Milestone } from "@/types/calculator";

export const defaultInputs: CalculatorInputs = {
  monthlyContribution: 400,
  childAge: 2,
  targetAge: 18,
  expectedReturnPercentPerYear: 6,
  initialLumpSum: 0,
};

export const defaultMilestones: Milestone[] = [
  {
    id: "gift-12",
    title: "Geschenk Großeltern",
    age: 12,
    amount: 2000,
    type: "income",
    description: "Einmalige Zuwendung der Großeltern.",
  },
  {
    id: "license-16",
    title: "Führerschein & erstes Auto",
    age: 16,
    amount: -3500,
    type: "expense",
    description: "Kosten für Führerschein und erstes Auto.",
  },
  {
    id: "university-18",
    title: "Studienstart",
    age: 18,
    amount: -15000,
    type: "expense",
    description: "Erste Studien- und Lebenshaltungskosten.",
  },
  {
    id: "home-25",
    title: "Eigenkapital Immobilie",
    age: 25,
    amount: -30000,
    type: "expense",
    description:
      "Optional: Eigenkapital für die erste Immobilie (wird nur berücksichtigt, wenn das Zielalter ≥ 25 ist).",
  },
];


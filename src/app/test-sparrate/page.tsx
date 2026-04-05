"use client";

import { useCallback, useState } from "react";

import {
  VariableSparraten,
  type VariableSparratenChangePayload,
} from "@/components/calculator/VariableSparraten";
import { formatCurrency } from "@/lib/format";

const TEST_CHILD_AGE = 2;
const TEST_TARGET_AGE = 67;

export default function TestSparratePage() {
  const [payload, setPayload] = useState<VariableSparratenChangePayload | null>(
    null,
  );

  const handleChange = useCallback((p: VariableSparratenChangePayload) => {
    console.log("VariableSparraten payload", p);
    setPayload(p);
  }, []);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 text-slate-900">
      <h1 className="mb-2 text-xl font-semibold">Test: Variable Sparraten</h1>
      <p className="mb-6 text-sm text-slate-600">
        Feste Werte: Alter {TEST_CHILD_AGE} → {TEST_TARGET_AGE}, Startkapital 0
        €, Basis-Sparrate 259 €/Monat.
      </p>

      <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <h2 className="mb-2 font-medium text-slate-800">
          Phasen an runSimulationWithPhases (nach Lückenfüllung, Basisrate)
        </h2>
        {payload && payload.phases.length > 0 ? (
          <ol className="list-decimal space-y-1 pl-5 font-mono text-slate-800">
            {payload.phases.map((phase, i) => {
              const vonAlter = TEST_CHILD_AGE + phase.vonJahr;
              const bisAlter = TEST_CHILD_AGE + phase.bisJahr;
              return (
                <li key={`${phase.vonJahr}-${phase.bisJahr}-${i}`}>
                  Alter {vonAlter} bis {bisAlter}:{" "}
                  {formatCurrency(phase.sparrate)} / Monat
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-slate-500">Noch keine Phasen.</p>
        )}
      </section>

      <section className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <h2 className="mb-2 font-medium text-slate-800">Letzte Payload</h2>
        {payload ? (
          <ul className="space-y-1 font-mono text-slate-800">
            <li>
              <span className="text-slate-500">Endvermögen:</span>{" "}
              {formatCurrency(payload.finalBalance)}
            </li>
            <li>
              <span className="text-slate-500">Eingezahlt:</span>{" "}
              {formatCurrency(payload.totalContributions)}
            </li>
            <li>
              <span className="text-slate-500">Zinsen:</span>{" "}
              {formatCurrency(payload.totalInterest)}
            </li>
            <li>
              <span className="text-slate-500">Phasen gültig:</span>{" "}
              {payload.valid ? "ja" : "nein"}
            </li>
          </ul>
        ) : (
          <p className="text-slate-500">Noch keine Berechnung.</p>
        )}
      </section>

      <VariableSparraten
        childCurrentAge={TEST_CHILD_AGE}
        targetAge={TEST_TARGET_AGE}
        initialLumpSum={0}
        baseMonthlyContribution={259}
        onChange={handleChange}
      />
    </main>
  );
}

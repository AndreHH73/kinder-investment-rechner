"use client";

import { useCallback, useMemo, useState } from "react";

import {
  VariableSparraten,
  type VariableSparratenChangePayload,
} from "@/components/calculator/VariableSparraten";
import { formatCurrency } from "@/lib/format";
import { runSimulationWithPhases } from "@/lib/simulation";

/** Hardcodierte Test-Einlagen/Entnahmen für runSimulationWithPhases (zweites Argument). */
const TEST_CASHFLOW_EVENTS = [
  { age: 18, amount: -3500, label: "Führerschein" },
  { age: 19, amount: -10000, label: "Studium" },
  { age: 30, amount: 5000, label: "Geschenk Oma" },
] as const;

export default function TestSparratePage() {
  const [childCurrentAge, setChildCurrentAge] = useState(2);
  const [targetAge, setTargetAge] = useState(67);
  const [monthlyRate, setMonthlyRate] = useState(259);

  const [payload, setPayload] = useState<VariableSparratenChangePayload | null>(
    null,
  );

  const handleChange = useCallback((p: VariableSparratenChangePayload) => {
    console.log("VariableSparraten payload", p);
    setPayload(p);
  }, []);

  const finalBalanceWithCashflows = useMemo(() => {
    if (!payload?.valid || payload.phases.length === 0) return null;
    return runSimulationWithPhases(
      {
        childCurrentAge,
        targetAge,
        initialLumpSum: 0,
        phases: payload.phases,
      },
      [...TEST_CASHFLOW_EVENTS],
    ).finalBalance;
  }, [payload, childCurrentAge, targetAge]);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 text-slate-900">
      <h1 className="mb-2 text-xl font-semibold">Test: Variable Sparraten</h1>

      <div className="mb-6 flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          childCurrentAge
          <input
            type="number"
            value={childCurrentAge}
            onChange={(e) =>
              setChildCurrentAge(parseInt(e.target.value, 10) || 0)
            }
          />
        </label>
        <label className="flex items-center gap-2">
          targetAge
          <input
            type="number"
            value={targetAge}
            onChange={(e) =>
              setTargetAge(parseInt(e.target.value, 10) || 0)
            }
          />
        </label>
        <label className="flex items-center gap-2">
          monthlyRate
          <input
            type="number"
            value={monthlyRate}
            onChange={(e) =>
              setMonthlyRate(parseInt(e.target.value, 10) || 0)
            }
          />
        </label>
      </div>

      <p className="mb-6 text-sm text-slate-600">
        Basis: Alter {childCurrentAge} → {targetAge}, Startkapital 0 €,
        monatliche Basis-Sparrate {monthlyRate} €/Monat.
      </p>

      <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <h2 className="mb-2 font-medium text-slate-800">
          Phasen an runSimulationWithPhases (nach Lückenfüllung, Basisrate)
        </h2>
        {payload && payload.phases.length > 0 ? (
          <ol className="list-decimal space-y-1 pl-5 font-mono text-slate-800">
            {payload.phases.map((phase, i) => {
              const vonAlter = childCurrentAge + phase.vonJahr;
              const bisAlter = childCurrentAge + phase.bisJahr;
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

      <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <h2 className="mb-2 font-medium text-slate-800">Test-Cashflows</h2>
        <p className="mb-2 text-slate-600">
          Werden als zweites Argument an{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs">
            runSimulationWithPhases
          </code>{" "}
          übergeben.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-slate-800">
          {TEST_CASHFLOW_EVENTS.map((e) => (
            <li key={e.label}>
              Alter {e.age}: {formatCurrency(e.amount)} ({e.label})
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Endvermögen ohne Cashflows
            </p>
            <p className="mt-1 font-mono text-base font-semibold text-slate-900">
              {payload?.valid
                ? formatCurrency(payload.finalBalance)
                : "— (Phasen ungültig)"}
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Endvermögen mit Test-Cashflows
            </p>
            <p className="mt-1 font-mono text-base font-semibold text-slate-900">
              {finalBalanceWithCashflows != null
                ? formatCurrency(finalBalanceWithCashflows)
                : "— (Phasen ungültig)"}
            </p>
          </div>
        </div>
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
        childCurrentAge={childCurrentAge}
        targetAge={targetAge}
        initialLumpSum={0}
        baseMonthlyContribution={monthlyRate}
        onChange={handleChange}
      />
    </main>
  );
}

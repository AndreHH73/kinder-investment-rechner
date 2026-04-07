"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { formatCurrency } from "@/lib/format";
import { runSimulationWithPhases } from "@/lib/simulation";
import type { SparPhase } from "@/types/calculator";

type ExceptionRow = {
  id: string;
  vonAlter: number;
  bisAlter: number;
  sparrate: number;
};

function sortByVon(a: ExceptionRow, b: ExceptionRow): number {
  return a.vonAlter - b.vonAlter;
}

/** Vorgänger auf der Zeitachse (nach Von-Alter sortiert), nicht Listenposition. */
function getPreviousInTimeline(
  rows: ExceptionRow[],
  currentId: string,
): ExceptionRow | null {
  const sorted = [...rows].sort(sortByVon);
  const idx = sorted.findIndex((r) => r.id === currentId);
  if (idx <= 0) return null;
  return sorted[idx - 1]!;
}

/** Ausnahmen prüfen (ohne Basis-Lücken). */
function validateExceptions(
  rows: ExceptionRow[],
  childCurrentAge: number,
  targetAge: number,
): Map<string, string> {
  const errors = new Map<string, string>();

  for (const row of rows) {
    if (row.bisAlter <= row.vonAlter) {
      errors.set(row.id, "Bis-Alter muss größer als Von-Alter sein.");
    }
    if (
      row.vonAlter < childCurrentAge ||
      row.bisAlter > targetAge ||
      row.vonAlter > targetAge ||
      row.bisAlter < childCurrentAge
    ) {
      errors.set(
        row.id,
        `Alter muss zwischen ${childCurrentAge} und ${targetAge} liegen.`,
      );
    }
  }

  const sorted = [...rows].sort(sortByVon);
  for (let i = 1; i < sorted.length; i += 1) {
    const cur = sorted[i]!;
    const prev = sorted[i - 1]!;
    if (cur.vonAlter <= prev.bisAlter && !errors.has(cur.id)) {
      errors.set(
        cur.id,
        `Diese Phase muss nach Alter ${prev.bisAlter} beginnen.`,
      );
    }
  }

  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i]!;
      const b = rows[j]!;
      const overlaps =
        Math.max(a.vonAlter, b.vonAlter) <= Math.min(a.bisAlter, b.bisAlter);
      if (!overlaps) continue;

      const first =
        a.vonAlter < b.vonAlter ||
        (a.vonAlter === b.vonAlter &&
          (a.bisAlter < b.bisAlter ||
            (a.bisAlter === b.bisAlter && a.id < b.id)))
          ? a
          : b;
      const second = first.id === a.id ? b : a;
      const msg = `Diese Phase muss nach Alter ${first.bisAlter} beginnen.`;
      if (!errors.has(second.id)) {
        errors.set(second.id, msg);
      }
    }
  }

  return errors;
}

/**
 * Lückenlose Phasenliste: Ausnahmen nach Von-Alter sortiert, Zwischenräume
 * und Randbereiche mit Basisrate auffüllen → von childCurrentAge bis targetAge.
 */
function mergeExceptionsToSparPhases(
  exceptions: ExceptionRow[],
  childCurrentAge: number,
  targetAge: number,
  baseMonthlyContribution: number,
): SparPhase[] {
  const sorted = exceptions
    .map((row) => ({
      vonAlter: row.vonAlter,
      bisAlter: row.bisAlter,
      sparrate: row.sparrate,
    }))
    .sort((a, b) => a.vonAlter - b.vonAlter);
  const segments: { vonAlter: number; bisAlter: number; sparrate: number }[] =
    [];
  let cursor = childCurrentAge;

  for (const exception of sorted) {
    if (cursor < exception.vonAlter) {
      segments.push({
        vonAlter: cursor,
        bisAlter: exception.vonAlter - 1,
        sparrate: baseMonthlyContribution,
      });
    }
    segments.push({
      vonAlter: exception.vonAlter,
      bisAlter: exception.bisAlter,
      sparrate: exception.sparrate,
    });
    cursor = exception.bisAlter + 1;
  }

  if (cursor <= targetAge) {
    segments.push({
      vonAlter: cursor,
      bisAlter: targetAge,
      sparrate: baseMonthlyContribution,
    });
  }

  return segments.map((p) => {
    const vonAlter = Number(p.vonAlter);
    const bisAlter = Number(p.bisAlter);
    const childAge = Number(childCurrentAge);
    return {
      // Altersgrenzen direkt relativ zum aktuellen Kindesalter.
      vonJahr: vonAlter - childAge,
      bisJahr: bisAlter - childAge,
      sparrate: Number(p.sparrate),
    };
  });
}

export type VariableSparratenChangePayload = {
  valid: boolean;
  phases: SparPhase[];
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
};

type VariableSparratenProps = {
  childCurrentAge: number;
  targetAge: number;
  initialLumpSum: number;
  baseMonthlyContribution: number;
  annualReturnPercent?: number;
  contributionsAtMonthStart?: boolean;
  onChange: (payload: VariableSparratenChangePayload) => void;
};

/**
 * Freies Tippen: text + inputMode (kein kontrolliertes type=number),
 * Sync von value nur ohne Fokus (sonst überschreibt z. B. Koppelung Von→Bis den Entwurf).
 */
function ExceptionNumberField({
  inputId,
  label,
  value,
  min,
  max,
  onCommit,
}: {
  inputId: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(() => String(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (focusedRef.current) return;
    // Synchronisation von Parent (z. B. nach Koppelung der Felder), nicht während der Fokus auf diesem Input liegt
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bewusstes Prop-Sync für draft
    setDraft(String(value));
  }, [value]);

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);

  const commitDraft = () => {
    if (draft === "") {
      onCommit(lo);
      setDraft(String(lo));
      return;
    }
    let n = Number.parseInt(draft, 10);
    if (Number.isNaN(n)) {
      onCommit(lo);
      setDraft(String(lo));
      return;
    }
    n = Math.min(hi, Math.max(lo, n));
    onCommit(n);
    setDraft(String(n));
  };

  return (
    <div>
      <label className="typo-a3 block text-slate-500" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onChange={(e) => {
          const t = e.target.value;
          if (t === "" || /^\d+$/.test(t)) {
            setDraft(t);
          }
        }}
        onBlur={() => {
          focusedRef.current = false;
          commitDraft();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm tabular-nums"
      />
    </div>
  );
}

function newExceptionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `exc-${crypto.randomUUID()}`;
  }
  return `exc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function VariableSparraten({
  childCurrentAge,
  targetAge,
  initialLumpSum,
  baseMonthlyContribution,
  annualReturnPercent,
  contributionsAtMonthStart,
  onChange,
}: VariableSparratenProps) {
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);

  const errorById = useMemo(
    () => validateExceptions(exceptions, childCurrentAge, targetAge),
    [exceptions, childCurrentAge, targetAge],
  );

  const payload = useMemo((): VariableSparratenChangePayload => {
    const merged = mergeExceptionsToSparPhases(
      exceptions,
      childCurrentAge,
      targetAge,
      baseMonthlyContribution,
    );
    const validationErrors = validateExceptions(
      exceptions,
      childCurrentAge,
      targetAge,
    );
    if (validationErrors.size > 0) {
      return {
        valid: false,
        phases: merged,
        finalBalance: 0,
        totalContributions: 0,
        totalInterest: 0,
      };
    }

    const result = runSimulationWithPhases({
      childCurrentAge,
      targetAge,
      initialLumpSum,
      phases: merged,
      annualReturnPercent,
      contributionsAtMonthStart,
    });

    return {
      valid: true,
      phases: merged,
      finalBalance: result.finalBalance,
      totalContributions: result.totalContributions,
      totalInterest: result.totalInterest,
    };
  }, [
    exceptions,
    childCurrentAge,
    targetAge,
    baseMonthlyContribution,
    initialLumpSum,
    annualReturnPercent,
    contributionsAtMonthStart,
  ]);

  useEffect(() => {
    onChange(payload);
  }, [payload, onChange]);

  const updateExceptionById = (
    id: string,
    patch: Partial<Pick<ExceptionRow, "vonAlter" | "bisAlter" | "sparrate">>,
  ) => {
    setExceptions((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (next.bisAlter <= next.vonAlter) {
          next.bisAlter = Math.min(next.vonAlter + 1, targetAge);
        }
        return next;
      }),
    );
  };

  const addException = () => {
    setExceptions((prev) => {
      const sorted = [...prev].sort(sortByVon);
      const last = sorted[sorted.length - 1];
      let vonAlter: number;
      let bisAlter: number;
      if (!last) {
        vonAlter = childCurrentAge;
        bisAlter = Math.min(vonAlter + 1, targetAge);
      } else {
        vonAlter = last.bisAlter + 1;
        bisAlter = Math.min(vonAlter + 1, targetAge);
        if (bisAlter <= vonAlter) {
          bisAlter = targetAge;
          if (bisAlter <= vonAlter) {
            vonAlter = Math.max(childCurrentAge, targetAge - 1);
          }
        }
      }
      return [
        ...prev,
        {
          id: newExceptionId(),
          vonAlter,
          bisAlter,
          sparrate: 0,
        },
      ];
    });
  };

  const removeExceptionAt = (index: number) => {
    setExceptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section
      className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-900/5 backdrop-blur-[2px]"
      aria-label="Variable Sparraten"
    >
      <h2 className="typo-a1 text-foreground">Wenn sich deine Sparrate verändert</h2>
      <p className="typo-a2 mt-1 text-slate-600">
        Plane auch realistische Phasen ein - zum Beispiel, wenn du vorübergehend
        weniger sparen kannst, eine Pause brauchst oder später mehr zurücklegen
        möchtest. Wir zeigen dir sofort, wie sich das auf die Lebensschritte
        deines Kindes auswirkt.
      </p>

      <p className="typo-a2 mt-4 font-medium text-slate-800">
        Basis-Sparrate: {formatCurrency(baseMonthlyContribution)} / Monat
      </p>
      <p className="typo-a4 mt-1 text-slate-500">
        Diese Sparrate gilt standardmäßig für die gesamte Laufzeit. Einzelne
        Sparphasen können sie zeitweise verändern.
      </p>

      <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-3">
        <p className="typo-a3 text-slate-800">Typische Beispiele:</p>
        <ul className="typo-a4 mt-2 list-disc space-y-1 pl-5 text-slate-700">
          <li>vorübergehend weniger sparen</li>
          <li>eine Sparpause einplanen</li>
          <li>später die Sparrate erhöhen</li>
        </ul>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {exceptions.map((row, index) => {
          const err = errorById.get(row.id);
          const prevTimeline = getPreviousInTimeline(exceptions, row.id);
          const vonMin = prevTimeline
            ? prevTimeline.bisAlter + 1
            : childCurrentAge;
          const vonMax = Math.max(
            vonMin,
            Math.min(targetAge - 1, row.bisAlter - 1),
          );
          const bisMin = row.vonAlter + 1;

          return (
            <div
              key={row.id}
              className="rounded-3xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="typo-a2 font-medium text-slate-800">
                  Von {row.vonAlter} bis {row.bisAlter} Jahren sparst du{" "}
                  {formatCurrency(row.sparrate)} / Monat
                </p>
                <button
                  type="button"
                  aria-label={`Ausnahme ${index + 1} entfernen`}
                  onClick={() => removeExceptionAt(index)}
                  className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-base text-slate-500 shadow-sm transition-colors hover:border-red-100 hover:text-red-600 active:opacity-80"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <ExceptionNumberField
                  inputId={`${row.id}-von`}
                  label="Ab Alter"
                  value={row.vonAlter}
                  min={vonMin}
                  max={vonMax}
                  onCommit={(n) =>
                    updateExceptionById(row.id, { vonAlter: n })
                  }
                />
                <ExceptionNumberField
                  inputId={`${row.id}-bis`}
                  label="Bis Alter"
                  value={row.bisAlter}
                  min={bisMin}
                  max={targetAge}
                  onCommit={(n) =>
                    updateExceptionById(row.id, { bisAlter: n })
                  }
                />
                <ExceptionNumberField
                  inputId={`${row.id}-rate`}
                  label="Sparrate pro Monat"
                  value={row.sparrate}
                  min={0}
                  max={2000}
                  onCommit={(n) =>
                    updateExceptionById(row.id, { sparrate: n })
                  }
                />
              </div>
              <p className="typo-a4 mt-2 text-slate-500">
                Trage hier ein, in welchem Alter deines Kindes sich deine
                monatliche Sparrate verändert. So kannst du zum Beispiel eine
                Sparpause, eine niedrigere Rate oder eine spätere Erhöhung
                realistisch einplanen.
              </p>

              {err ? (
                <p className="typo-a4 mt-2 text-red-600" role="alert">
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addException}
        className="typo-a4 mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 font-semibold text-primary-action shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-action focus:ring-offset-2 sm:w-auto"
      >
        Sparphase hinzufügen
      </button>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="typo-a3 text-slate-800">So verändert sich dein Plan</p>
        <p className="typo-a4 mt-1 text-slate-600">
          Du siehst sofort, ob die Lebensschritte deines Kindes weiterhin
          finanzierbar bleiben - oder wo noch eine Lücke entsteht.
        </p>
      </div>
    </section>
  );
}

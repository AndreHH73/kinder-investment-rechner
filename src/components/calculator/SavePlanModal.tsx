import { useState } from "react";

import type { CalculatorInputs, Milestone } from "@/types/calculator";

interface SavePlanModalProps {
  open: boolean;
  inputs: CalculatorInputs;
  milestones: Milestone[];
  onClose: () => void;
}

interface PlanFormState {
  childName: string;
  birthYear: string;
  email: string;
}

export function SavePlanModal({
  open,
  inputs,
  milestones,
  onClose,
}: SavePlanModalProps) {
  const [form, setForm] = useState<PlanFormState>({
    childName: "",
    birthYear: "",
    email: "",
  });
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const update = (patch: Partial<PlanFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    if (typeof window === "undefined") return;

    const existingRaw =
      window.localStorage.getItem("kinder-investment-plans") ?? "[]";
    let existing: unknown;
    try {
      existing = JSON.parse(existingRaw);
    } catch {
      existing = [];
    }

    const plans = Array.isArray(existing) ? existing : [];
    const plan = {
      id: `plan-${Date.now()}`,
      childName: form.childName,
      birthYear: form.birthYear,
      email: form.email,
      inputs,
      milestones,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      "kinder-investment-plans",
      JSON.stringify([...plans, plan]),
    );

    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Plan speichern
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Schließen
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Speichere die aktuellen Parameter und Lebensschritte lokal auf diesem
          Gerät. Später kann diese Funktion mit einem Backend verbunden werden.
        </p>
        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700">
              Name des Kindes
            </label>
            <input
              type="text"
              value={form.childName}
              onChange={(e) => update({ childName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700">
              Geburtsjahr
            </label>
            <input
              type="number"
              min={1900}
              max={2100}
              value={form.birthYear}
              onChange={(e) => update({ birthYear: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          {saved && (
            <p className="text-emerald-700">
              Plan wurde erfolgreich lokal gespeichert.
            </p>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-sky-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-sky-700"
            >
              Plan speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


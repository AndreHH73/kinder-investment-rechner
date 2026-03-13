import { useEffect, useState } from "react";

import type { Milestone, MilestoneType } from "@/types/calculator";

interface MilestoneFormProps {
  initial: Milestone | null;
  mode: "create" | "edit";
  onSubmit: (milestone: Milestone) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const typeOptions: { value: MilestoneType; label: string }[] = [
  { value: "income", label: "Einnahme" },
  { value: "expense", label: "Ausgabe" },
];

export function MilestoneForm({
  initial,
  mode,
  onSubmit,
  onDelete,
  onClose,
}: MilestoneFormProps) {
  const [draft, setDraft] = useState<Milestone | null>(initial);
  const [amountInput, setAmountInput] = useState<string>(
    initial ? String(initial.amount) : "",
  );

  useEffect(() => {
    setDraft(initial);
    setAmountInput(initial ? String(initial.amount) : "");
  }, [initial]);

  if (!draft) return null;

  const update = (patch: Partial<Milestone>) => {
    setDraft({ ...draft, ...patch });
  };

  const handleSubmit = () => {
    const normalized = amountInput.replace(",", ".").trim();
    const parsed =
      normalized === "" || normalized === "-" ? 0 : Number(normalized);
    const safeAmount = Number.isFinite(parsed) ? parsed : 0;

    onSubmit({
      ...draft,
      amount: safeAmount,
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(draft.id);
    }
  };

  const title =
    mode === "create" ? "Neuen Meilenstein anlegen" : "Meilenstein bearbeiten";

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Schließen
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700">
              Titel des Meilensteins
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700">
                Alter (Jahre)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.age}
                onChange={(e) => update({ age: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Typ</label>
              <select
                value={draft.type}
                onChange={(e) =>
                  update({ type: e.target.value as MilestoneType })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700">
              Betrag in Euro
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Positive Beträge erhöhen, negative Beträge verringern das
              Vermögen.
            </p>
          </div>
          <div>
            <label className="block font-medium text-slate-700">
              Beschreibung (optional)
            </label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-2 text-xs">
          {mode === "edit" && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-rose-200 px-3 py-1.5 text-rose-700 hover:bg-rose-50"
            >
              Meilenstein löschen
            </button>
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
              onClick={handleSubmit}
              className="rounded-full bg-sky-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-sky-700"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



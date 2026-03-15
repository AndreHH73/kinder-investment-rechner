import { formatCurrency } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";

interface MobileInputStepProps {
  value: CalculatorInputs;
  onChange: (value: CalculatorInputs) => void;
  onNext: () => void;
}

export function MobileInputStep({
  value,
  onChange,
  onNext,
}: MobileInputStepProps) {
  const update = (patch: Partial<CalculatorInputs>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <section className="rounded-3xl bg-surface p-5 shadow-sm shadow-primary/5">
      <h2 className="text-sm font-semibold text-foreground">
        Schritt 1 – Eckdaten
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Starte mit den wichtigsten Angaben. Du kannst Details später jederzeit
        anpassen.
      </p>

      <div className="mt-4 grid gap-3 text-xs md:grid-cols-3">
        <div className="rounded-2xl border border-muted bg-background px-4 py-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Alter des Kindes</p>
          <div className="mt-1 grid grid-cols-[90px_32px_auto] items-center">
            <input
              type="number"
              min={0}
              max={18}
              step={1}
              value={value.childAge}
              onChange={(e) =>
                update({ childAge: Number(e.target.value) || 0 })
              }
              className="w-full border-none bg-transparent text-left text-[26px] font-semibold text-foreground outline-none"
            />
            <div />
            <span className="text-sm text-slate-500">Jahre</span>
          </div>
          <input
            type="range"
            min={0}
            max={18}
            step={1}
            value={value.childAge}
            onChange={(e) =>
              update({ childAge: Number(e.target.value) || 0 })
            }
            className="ff-slider mt-3 w-full cursor-pointer accent-primary-action"
          />
        </div>
        <div className="rounded-2xl border border-muted bg-background px-4 py-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Monatliche Sparrate</p>
          <div className="mt-1 grid grid-cols-[90px_32px_auto] items-center">
            <input
              type="number"
              min={25}
              max={1000}
              step={25}
              value={value.monthlyContribution}
              onChange={(e) =>
                update({
                  monthlyContribution: Number(e.target.value) || 0,
                })
              }
              className="w-full border-none bg-transparent text-left text-[26px] font-semibold text-foreground outline-none"
            />
            <div />
            <span className="text-sm text-slate-500">€</span>
          </div>
          <input
            type="range"
            min={25}
            max={1000}
            step={25}
            value={value.monthlyContribution}
            onChange={(e) =>
              update({ monthlyContribution: Number(e.target.value) })
            }
            className="ff-slider mt-3 w-full cursor-pointer accent-primary-action"
          />
        </div>
        <div className="rounded-2xl border border-muted bg-background px-4 py-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Zielalter</p>
          <div className="mt-1 grid grid-cols-[90px_32px_auto] items-center">
            <input
              type="number"
              min={16}
              max={67}
              step={1}
              value={value.targetAge}
              onChange={(e) => {
                const raw = Number(e.target.value) || 16;
                const clamped = Math.max(value.childAge + 1, raw);
                update({ targetAge: clamped });
              }}
              className="w-full border-none bg-transparent text-left text-[26px] font-semibold text-foreground outline-none"
            />
            <div />
            <span className="text-sm text-slate-500">Jahre</span>
          </div>
          <input
            type="range"
            min={16}
            max={67}
            step={1}
            value={value.targetAge}
            onChange={(e) => {
              const raw = Number(e.target.value) || 16;
              const clamped = Math.max(value.childAge + 1, raw);
              update({ targetAge: clamped });
            }}
            className="ff-slider mt-3 w-full cursor-pointer accent-primary-action"
          />
        </div>
      </div>

      <details className="mt-4 rounded-2xl border border-muted bg-background px-3 py-2 text-xs text-foreground">
        <summary className="cursor-pointer list-none font-medium">
          Weitere Einstellungen
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block font-medium text-foreground">
              Erwartete Rendite p.a.
            </label>
            <input
              type="number"
              min={-10}
              max={20}
              step={0.1}
              value={value.expectedReturnPercentPerYear}
              onChange={(e) =>
                update({
                  expectedReturnPercentPerYear: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-medium text-foreground">
              Startkapital (optional)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={value.initialLumpSum}
              onChange={(e) =>
                update({ initialLumpSum: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      </details>

      <button
        type="button"
        onClick={onNext}
        className="mt-5 w-full rounded-full bg-primary-action px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#1a4a75] focus:outline-none focus:ring-2 focus:ring-primary-action focus:ring-offset-2"
      >
        Lebensschritte planen
      </button>

    </section>
  );
}


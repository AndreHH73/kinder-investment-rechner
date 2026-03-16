import { formatCurrency } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";

interface MobileInputStepProps {
  value: CalculatorInputs;
  onChange: (value: CalculatorInputs) => void;
  onSliderChange?: (value: CalculatorInputs) => void;
  onSliderCommit?: (value: CalculatorInputs) => void;
}

export function MobileInputStep({
  value,
  onChange,
  onSliderChange,
  onSliderCommit,
}: MobileInputStepProps) {
  const update = (patch: Partial<CalculatorInputs>) => {
    onChange({ ...value, ...patch });
  };

  const updateSlider = (patch: Partial<CalculatorInputs>) => {
    if (onSliderChange) {
      onSliderChange({ ...value, ...patch });
    } else {
      onChange({ ...value, ...patch });
    }
  };

  const commitSlider = (patch: Partial<CalculatorInputs>) => {
    if (onSliderCommit) {
      onSliderCommit({ ...value, ...patch });
    } else {
      onChange({ ...value, ...patch });
    }
  };

  return (
    <section className="rounded-3xl bg-surface p-5 shadow-sm shadow-primary/5">
      <h2 className="typo-a1 text-foreground">
        Die Basis für den Pinguin-Plan
      </h2>
      <p className="typo-a2 mt-1 text-slate-500">
        Mit ein paar Angaben entsteht ein Plan, der zu eurem Kind und euren Möglichkeiten passt.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-muted bg-background px-4 py-3 shadow-sm">
          <p className="typo-a3 text-slate-500">Alter deines Kindes heute</p>
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
            <span className="typo-a4 text-slate-500">Jahre</span>
          </div>
          <input
            type="range"
            min={0}
            max={18}
            step={1}
            value={value.childAge}
            onChange={(e) =>
              updateSlider({ childAge: Number(e.target.value) || 0 })
            }
            onMouseUp={(e) =>
              commitSlider({ childAge: Number((e.target as HTMLInputElement).value) || 0 })
            }
            onTouchEnd={(e) => {
              const target = e.target as HTMLInputElement;
              commitSlider({ childAge: Number(target.value) || 0 });
            }}
            onPointerUp={(e) =>
              commitSlider({ childAge: Number((e.target as HTMLInputElement).value) || 0 })
            }
            className="ff-slider mt-3 w-full cursor-pointer accent-primary-action"
          />
        </div>
        <div className="rounded-2xl border border-muted bg-background px-4 py-3 shadow-sm">
          <p className="typo-a3 text-slate-500">Monatliche Sparrate</p>
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
            <span className="typo-a4 text-slate-500">€</span>
          </div>
          <input
            type="range"
            min={25}
            max={1000}
            step={25}
            value={value.monthlyContribution}
            onChange={(e) =>
              updateSlider({ monthlyContribution: Number(e.target.value) })
            }
            onMouseUp={(e) =>
              commitSlider({
                monthlyContribution: Number(
                  (e.target as HTMLInputElement).value,
                ),
              })
            }
            onTouchEnd={(e) => {
              const target = e.target as HTMLInputElement;
              commitSlider({
                monthlyContribution: Number(target.value),
              });
            }}
            onPointerUp={(e) =>
              commitSlider({
                monthlyContribution: Number(
                  (e.target as HTMLInputElement).value,
                ),
              })
            }
            className="ff-slider mt-3 w-full cursor-pointer accent-primary-action"
          />
        </div>
        <div className="rounded-2xl border border-muted bg-background px-4 py-3 shadow-sm">
          <p className="typo-a3 text-slate-500">Plan bis zum Alter von</p>
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
            <span className="typo-a4 text-slate-500">Jahre</span>
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
              updateSlider({ targetAge: clamped });
            }}
            onMouseUp={(e) => {
              const raw = Number((e.target as HTMLInputElement).value) || 16;
              const clamped = Math.max(value.childAge + 1, raw);
              commitSlider({ targetAge: clamped });
            }}
            onTouchEnd={(e) => {
              const target = e.target as HTMLInputElement;
              const raw = Number(target.value) || 16;
              const clamped = Math.max(value.childAge + 1, raw);
              commitSlider({ targetAge: clamped });
            }}
            onPointerUp={(e) => {
              const raw = Number((e.target as HTMLInputElement).value) || 16;
              const clamped = Math.max(value.childAge + 1, raw);
              commitSlider({ targetAge: clamped });
            }}
            className="ff-slider mt-3 w-full cursor-pointer accent-primary-action"
          />
        </div>
      </div>

      <details className="typo-a4 mt-4 rounded-2xl border border-muted bg-background px-3 py-2 text-foreground">
        <summary className="cursor-pointer list-none font-medium">
          Weitere Einstellungen
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="typo-a4-medium block text-foreground">
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
            <label className="typo-a4-medium block text-foreground">
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
    </section>
  );
}


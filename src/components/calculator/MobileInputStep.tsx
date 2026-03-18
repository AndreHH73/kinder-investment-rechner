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
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

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
    <section
      id="plan-start"
      className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-900/5 backdrop-blur-[2px]"
    >
      <h2 className="typo-a1 text-foreground">
        Die Basis für den Pinguin-Plan
      </h2>
      <p className="typo-a2 mt-1 text-slate-600">
        Mit ein paar Angaben entsteht dein persönlicher Pinguin-Plan.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm">
          <p className="typo-a3 text-slate-500">Alter deines Kindes heute</p>
          <div className="mt-1 grid grid-cols-[88px_1fr_88px] items-center">
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Alter verringern"
                onClick={() =>
                  update({
                    childAge: clamp(value.childAge - 1, 0, 18),
                  })
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80"
              >
                −
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={18}
              step={1}
              value={value.childAge}
              onChange={(e) =>
                update({ childAge: Number(e.target.value) || 0 })
              }
              className="ff-number w-full border-none bg-transparent text-center text-[26px] font-semibold tabular-nums text-foreground outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Alter erhöhen"
                onClick={() =>
                  update({
                    childAge: clamp(value.childAge + 1, 0, 18),
                  })
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80"
              >
                +
              </button>
              <span className="typo-a4 text-slate-500 md:hidden">J.</span>
              <span className="typo-a4 hidden text-slate-500 md:inline">
                Jahre
              </span>
            </div>
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
            className="ff-slider ff-slider-green mt-3 w-full cursor-pointer accent-emerald-600"
          />
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm">
          <p className="typo-a3 text-slate-500">Monatliche Sparrate</p>
          <div className="mt-1 grid grid-cols-[88px_1fr_88px] items-center">
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Sparrate verringern"
                onClick={() =>
                  update({
                    monthlyContribution: clamp(
                      value.monthlyContribution - 25,
                      25,
                      1000,
                    ),
                  })
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80"
              >
                −
              </button>
            </div>
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
              className="ff-number w-full border-none bg-transparent text-center text-[26px] font-semibold tabular-nums text-foreground outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Sparrate erhöhen"
                onClick={() =>
                  update({
                    monthlyContribution: clamp(
                      value.monthlyContribution + 25,
                      25,
                      1000,
                    ),
                  })
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80"
              >
                +
              </button>
              <span className="typo-a4 text-slate-500">€</span>
            </div>
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
            className="ff-slider ff-slider-green mt-3 w-full cursor-pointer accent-emerald-600"
          />
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm">
          <p className="typo-a3 text-slate-500">Plan bis zum Alter von</p>
          <div className="mt-1 grid grid-cols-[88px_1fr_88px] items-center">
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Zielalter verringern"
                onClick={() => {
                  const min = Math.max(value.childAge + 1, 16);
                  update({
                    targetAge: clamp(value.targetAge - 1, min, 67),
                  });
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80"
              >
                −
              </button>
            </div>
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
              className="ff-number w-full border-none bg-transparent text-center text-[26px] font-semibold tabular-nums text-foreground outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Zielalter erhöhen"
                onClick={() => {
                  const min = Math.max(value.childAge + 1, 16);
                  update({
                    targetAge: clamp(value.targetAge + 1, min, 67),
                  });
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80"
              >
                +
              </button>
              <span className="typo-a4 text-slate-500 md:hidden">J.</span>
              <span className="typo-a4 hidden text-slate-500 md:inline">
                Jahre
              </span>
            </div>
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
            className="ff-slider ff-slider-green mt-3 w-full cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      <details className="typo-a4 mt-4 rounded-3xl border border-slate-100 bg-white/70 px-3 py-2 text-foreground shadow-sm">
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


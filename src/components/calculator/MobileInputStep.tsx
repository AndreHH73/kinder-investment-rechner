import { formatCurrency } from "@/lib/format";
import type { CalculatorInputs } from "@/types/calculator";

interface MobileInputStepProps {
  value: CalculatorInputs;
  onChange: (value: CalculatorInputs) => void;
  onSliderChange?: (value: CalculatorInputs) => void;
  onSliderCommit?: (value: CalculatorInputs) => void;
  childAgeMax?: number;
  targetAgeMin?: number;
  targetAgeMax?: number;
  /** Desktop-Konfig: Felder untereinander, größere Typo & Klickflächen */
  layout?: "default" | "desktopStacked";
}

export function MobileInputStep({
  value,
  onChange,
  onSliderChange,
  onSliderCommit,
  childAgeMax = 18,
  targetAgeMin = 16,
  targetAgeMax = 67,
  layout = "default",
}: MobileInputStepProps) {
  const isDesktopStacked = layout === "desktopStacked";

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

  const fieldsGridClass = isDesktopStacked
    ? "mt-6 grid grid-cols-1 gap-6"
    : "mt-4 grid gap-3 md:grid-cols-3";

  const blockClass = isDesktopStacked
    ? "rounded-3xl border border-slate-100 bg-white/70 px-5 py-5 shadow-sm lg:px-6 lg:py-6"
    : "rounded-3xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm";

  const rowGridClass = isDesktopStacked
    ? "mt-2 grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3"
    : "mt-1 grid grid-cols-[88px_1fr_88px] items-center";

  const stepBtnClass = isDesktopStacked
    ? "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-xl font-semibold text-slate-700 shadow-sm active:opacity-80"
    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-lg font-semibold text-slate-700 shadow-sm active:opacity-80";

  const valueInputClass = isDesktopStacked
    ? "ff-number w-full min-w-0 border-none bg-transparent text-center text-[32px] font-semibold leading-none tabular-nums text-foreground outline-none"
    : "ff-number w-full border-none bg-transparent text-center text-[26px] font-semibold tabular-nums text-foreground outline-none";

  const sliderMarginClass = isDesktopStacked ? "mt-4" : "mt-3";

  return (
    <section
      id="plan-start"
      className={
        isDesktopStacked
          ? "rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-[2px] lg:p-8"
          : "rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-900/5 backdrop-blur-[2px]"
      }
    >
      <h2 className="typo-a1 text-foreground">
        Die Basis für den Pinguin-Plan
      </h2>
      <p className="typo-a2 mt-1 text-slate-600">
        Mit ein paar Angaben entsteht dein persönlicher Pinguin-Plan.
      </p>

      <div className={fieldsGridClass}>
        <div className={blockClass}>
          <p className="typo-a3 text-slate-500">Alter deines Kindes heute</p>
          <div className={rowGridClass}>
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Alter verringern"
                onClick={() =>
                  update({
                    childAge: clamp(value.childAge - 1, 0, childAgeMax),
                  })
                }
                className={stepBtnClass}
              >
                −
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={childAgeMax}
              step={1}
              value={value.childAge}
              onChange={(e) =>
                update({ childAge: Number(e.target.value) || 0 })
              }
              className={valueInputClass}
            />
            <div className="flex min-w-0 items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Alter erhöhen"
                onClick={() =>
                  update({
                    childAge: clamp(value.childAge + 1, 0, childAgeMax),
                  })
                }
                className={stepBtnClass}
              >
                +
              </button>
              {isDesktopStacked ? (
                <span className="shrink-0 whitespace-nowrap pl-1 text-[15px] font-medium text-slate-500">
                  Jahre
                </span>
              ) : (
                <>
                  <span className="typo-a4 text-slate-500 md:hidden">J.</span>
                  <span className="typo-a4 hidden text-slate-500 md:inline">
                    Jahre
                  </span>
                </>
              )}
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={childAgeMax}
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
            className={`ff-slider ff-slider-green ${sliderMarginClass} w-full cursor-pointer accent-emerald-600`}
          />
        </div>
        <div className={blockClass}>
          <p className="typo-a3 text-slate-500">Monatliche Sparrate</p>
          <div className={rowGridClass}>
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
                className={stepBtnClass}
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
              className={valueInputClass}
            />
            <div className="flex min-w-0 items-center justify-end gap-2">
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
                className={stepBtnClass}
              >
                +
              </button>
              <span className="typo-a4 shrink-0 pr-1 text-slate-500">€</span>
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
            className={`ff-slider ff-slider-green ${sliderMarginClass} w-full cursor-pointer accent-emerald-600`}
          />
        </div>
        <div className={blockClass}>
          <p className="typo-a3 text-slate-500">Plan bis zum Alter von</p>
          <div className={rowGridClass}>
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Zielalter verringern"
                onClick={() => {
                  const min = Math.max(value.childAge + 1, targetAgeMin);
                  update({
                    targetAge: clamp(value.targetAge - 1, min, targetAgeMax),
                  });
                }}
                className={stepBtnClass}
              >
                −
              </button>
            </div>
            <input
              type="number"
              min={targetAgeMin}
              max={targetAgeMax}
              step={1}
              value={value.targetAge}
              onChange={(e) => {
                const raw = Number(e.target.value) || targetAgeMin;
                const clamped = clamp(
                  raw,
                  Math.max(value.childAge + 1, targetAgeMin),
                  targetAgeMax,
                );
                update({ targetAge: clamped });
              }}
              className={valueInputClass}
            />
            <div className="flex min-w-0 items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Zielalter erhöhen"
                onClick={() => {
                  const min = Math.max(value.childAge + 1, targetAgeMin);
                  update({
                    targetAge: clamp(value.targetAge + 1, min, targetAgeMax),
                  });
                }}
                className={stepBtnClass}
              >
                +
              </button>
              {isDesktopStacked ? (
                <span className="shrink-0 whitespace-nowrap pl-1 text-[15px] font-medium text-slate-500">
                  Jahre
                </span>
              ) : (
                <>
                  <span className="typo-a4 text-slate-500 md:hidden">J.</span>
                  <span className="typo-a4 hidden text-slate-500 md:inline">
                    Jahre
                  </span>
                </>
              )}
            </div>
          </div>
          <input
            type="range"
            min={targetAgeMin}
            max={targetAgeMax}
            step={1}
            value={value.targetAge}
            onChange={(e) => {
              const raw = Number(e.target.value) || targetAgeMin;
              const clamped = clamp(
                raw,
                Math.max(value.childAge + 1, targetAgeMin),
                targetAgeMax,
              );
              updateSlider({ targetAge: clamped });
            }}
            onMouseUp={(e) => {
              const raw =
                Number((e.target as HTMLInputElement).value) || targetAgeMin;
              const clamped = clamp(
                raw,
                Math.max(value.childAge + 1, targetAgeMin),
                targetAgeMax,
              );
              commitSlider({ targetAge: clamped });
            }}
            onTouchEnd={(e) => {
              const target = e.target as HTMLInputElement;
              const raw = Number(target.value) || targetAgeMin;
              const clamped = clamp(
                raw,
                Math.max(value.childAge + 1, targetAgeMin),
                targetAgeMax,
              );
              commitSlider({ targetAge: clamped });
            }}
            onPointerUp={(e) => {
              const raw =
                Number((e.target as HTMLInputElement).value) || targetAgeMin;
              const clamped = clamp(
                raw,
                Math.max(value.childAge + 1, targetAgeMin),
                targetAgeMax,
              );
              commitSlider({ targetAge: clamped });
            }}
            className={`ff-slider ff-slider-green ${sliderMarginClass} w-full cursor-pointer accent-emerald-600`}
          />
        </div>
      </div>

      <details
        className={
          isDesktopStacked
            ? "typo-a4 mt-6 rounded-3xl border border-slate-100 bg-white/70 px-4 py-3 text-foreground shadow-sm lg:px-5 lg:py-4"
            : "typo-a4 mt-4 rounded-3xl border border-slate-100 bg-white/70 px-3 py-2 text-foreground shadow-sm"
        }
      >
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


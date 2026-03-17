"use client";

const SUMMARY_CARDS = [
  {
    title: "Mehr Klarheit für dich",
    text: "Du weißt jetzt, was mit deinem aktuellen Sparplan realistisch erreichbar ist.",
    bgClass: "bg-[#F0F8FF]",
    borderClass: "border-sky-200/60",
    iconBg: "bg-sky-100",
  },
  {
    title: "Lebensschritte im Blick",
    text: "Du siehst, welche Stationen für dein Kind finanziell eingeplant werden können.",
    bgClass: "bg-[#F0FFF4]",
    borderClass: "border-emerald-200/60",
    iconBg: "bg-emerald-100",
  },
  {
    title: "Mehr Möglichkeiten fürs Kind",
    text: "Schon kleine Anpassungen können später noch mehr möglich machen.",
    bgClass: "bg-[#FAF5FF]",
    borderClass: "border-violet-200/60",
    iconBg: "bg-violet-100",
  },
] as const;

export function PlanSummarySection({
  onConsultationClick,
}: {
  onConsultationClick?: () => void;
}) {
  // Click-handling is controlled by the parent (open + scroll).
  return (
    <section className="rounded-3xl bg-white px-4 py-5 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-2">
        <h2 className="typo-a1 text-slate-900">
          Was dein Plan dir jetzt zeigt
        </h2>
        {/* Optional: funktioniert auch ohne Unterzeile, daher sehr dezent gehalten */}
        <p className="typo-a2 text-slate-500">
          So lässt sich dein aktueller Plan für dein Kind einordnen.
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-4" role="list">
        {SUMMARY_CARDS.map((card) => (
          <li key={card.title}>
            <div
              className={`flex items-center gap-3 rounded-xl border ${card.borderClass} ${card.bgClass} px-4 py-3.5`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
                aria-hidden
              >
                <span className="text-base text-slate-700">✓</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-snug text-slate-800">
                  {card.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-slate-600">
                  {card.text}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex flex-col gap-3">
          <h3 className="typo-a2 font-medium text-slate-900">
            Willst du deinem Kind diesen Plan ermöglichen?
          </h3>
          <p className="typo-a4 text-slate-600">
            Erfahre in einem kostenfreien Gespräch, wie du ihn passend zu deiner Situation umsetzen kannst.
          </p>
          <button
            type="button"
            onClick={onConsultationClick}
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary-action px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1a4a75] focus:outline-none focus:ring-2 focus:ring-primary-action focus:ring-offset-2"
          >
            Kostenfrei Plan besprechen
          </button>
        </div>
      </div>
    </section>
  );
}


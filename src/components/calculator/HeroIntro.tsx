"use client";

const BRAND_DARK = "#1A2E35";
const BRAND_GREEN = "#A7D7C5";
const BRAND_GREEN_DARK = "#86BFA8";

const HEADLINE = "So wird Sparen zu einem Plan für dein Kind";
const SUBLINE =
  "Sieh mit dem Pinguin-Plan auf einen Blick, was später möglich wird.";

const BENEFITS = [
  {
    title: "Mehr Klarheit für Eltern",
    subtitle: "Verstehe auf einen Blick, was möglich wird",
    icon: (
      <svg
        className="h-6 w-6"
        style={{ color: BRAND_GREEN_DARK }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Lebensschritte sicher planen",
    subtitle: "Führerschein, Ausbildung, erste Wohnung",
    icon: (
      <svg
        className="h-6 w-6"
        style={{ color: BRAND_GREEN_DARK }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 7V3m8 4V3m-9 8h10" />
        <path d="M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Mehr Chancen fürs Kind",
    subtitle: "Träume ermöglichen und Optionen öffnen",
    icon: (
      <svg
        className="h-6 w-6"
        style={{ color: BRAND_GREEN_DARK }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
] as const;

interface HeroIntroProps {
  onStart?: () => void;
}

export function HeroIntro({ onStart }: HeroIntroProps) {
  const handleStartClick = () => {
    if (onStart) {
      onStart();
      return;
    }
    const el = document.getElementById("plan-start");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header aria-label="Einstieg in den Pinguin-Plan">
      <div className="relative overflow-hidden px-1 pb-12 pt-7">

        <section className="mx-auto flex max-w-lg flex-col items-center text-center">
          <h1 className="text-[2.35rem] font-extrabold leading-tight tracking-tight text-[#1A2E35]">
            {HEADLINE}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600 [text-wrap:balance]">
            {SUBLINE}
          </p>
        </section>

        <section className="relative mx-auto mt-2 w-full max-w-md py-6 md:mt-11 md:py-10">
          <div
            className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full shadow-[0_1px_0_rgba(26,46,53,0.08)]"
            style={{
              background: "linear-gradient(90deg, #A7D7C5 0%, #D1EAE0 100%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
                style={{ border: `4px solid ${BRAND_GREEN}` }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: BRAND_GREEN }}
                />
              </div>
              <span className="mt-2 text-xs font-medium text-slate-400">
                Geburt
              </span>
            </div>

            <div className="-mt-16 flex flex-col items-center ff-animate-float">
              <div className="rounded-2xl border border-emerald-200/40 bg-white p-3 shadow-lg">
                <svg
                  className="h-6 w-6"
                  style={{ color: BRAND_GREEN_DARK }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div
                className="mt-2 h-4 w-4 rounded-full shadow-sm"
                style={{ background: BRAND_GREEN }}
              />
              <span className="mt-2 text-xs font-bold text-slate-900">
                Führerschein
              </span>
            </div>

            <div className="mt-12 flex flex-col items-center ff-animate-float">
              <div className="rounded-2xl border border-emerald-200/40 bg-white p-3 shadow-lg">
                <svg
                  className="h-6 w-6"
                  style={{ color: BRAND_GREEN_DARK }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 6.253v13" />
                  <path d="M12 6.253C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                  <path d="M12 6.253C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div
                className="mt-2 h-4 w-4 rounded-full shadow-sm"
                style={{ background: BRAND_GREEN }}
              />
              <span className="mt-2 text-center text-xs font-bold text-slate-900">
                Studium &amp;
                <br />
                Ausbildung
              </span>
            </div>

            <div className="-mt-16 flex flex-col items-center ff-animate-float">
              <div className="rounded-2xl border border-emerald-200/40 bg-white p-3 shadow-lg">
                <svg
                  className="h-6 w-6"
                  style={{ color: BRAND_GREEN_DARK }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 12l2-2m0 0l7-7 7 7" />
                  <path d="M5 10v10a1 1 0 001 1h3" />
                  <path d="M19 10v10a1 1 0 01-1 1h-3" />
                  <path d="M10 21v-4a1 1 0 011-1h2a1 1 0 011 1v4" />
                </svg>
              </div>
              <div
                className="mt-2 h-4 w-4 rounded-full shadow-sm"
                style={{ background: BRAND_GREEN }}
              />
              <span className="mt-2 text-xs font-bold text-slate-900">
                Wohnung
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-2 w-full max-w-lg space-y-4">
          {BENEFITS.map((card) => (
            <div
              key={card.title}
              className="grid h-[112px] grid-cols-[48px_1fr] items-start gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:items-center md:p-6"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-2xl"
                style={{ background: "rgba(167, 215, 197, 0.10)" }}
                aria-hidden
              >
                {card.icon}
              </div>
              <div className="min-w-0 self-stretch py-0.5">
                <div className="flex h-full flex-col justify-start gap-1 md:justify-center">
                  <p className="text-lg font-bold leading-tight text-slate-900">
                    {card.title}
                  </p>
                  <p className="text-[13px] leading-snug text-slate-600">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-6 w-full max-w-lg">
          <button
            type="button"
            onClick={handleStartClick}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#86BFA8] px-8 py-4 text-[17px] font-semibold text-white shadow-xl shadow-emerald-900/10 transition-colors hover:bg-[#79B19B] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#F9FBFA]"
          >
            Plan starten
          </button>
        </section>
      </div>
    </header>
  );
}

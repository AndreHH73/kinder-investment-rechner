"use client";

const HEADLINE = "Der Pinguin-Plan für dein Kind.";
const SUBLINE =
  "Alles, was du für dein Kind zurücklegst, wird hier zu einem klaren Plan. So siehst du, ob wichtige Lebensschritte später finanziell erreichbar sind.";

const CARDS = [
  {
    title: "Mehr Klarheit für Eltern",
    subtitle: "Verstehe auf einen Blick, was möglich wird",
    bgClass: "bg-[#F0F8FF]",
    borderClass: "border-sky-200/60",
    iconBg: "bg-sky-100",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Lebensschritte sicherer planen",
    subtitle: "Führerschein, Ausbildung, erste Wohnung",
    bgClass: "bg-[#F0FFF4]",
    borderClass: "border-emerald-200/60",
    iconBg: "bg-emerald-100",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600" aria-hidden>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "Mehr Möglichkeiten fürs Kind",
    subtitle: "Chancen eröffnen, Träume ermöglichen",
    bgClass: "bg-[#FAF5FF]",
    borderClass: "border-violet-200/60",
    iconBg: "bg-violet-100",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600" aria-hidden>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
] as const;

export function HeroIntro() {
  return (
    <header
      className="flex flex-col pt-6 pb-8"
      aria-label="Einstieg in den Pinguin-Plan"
    >
      <div className="flex flex-col gap-7">
        {/* Headline – wie Figma: sehr groß, fett, dunkel */}
        <h1 className="max-w-xl text-[1.875rem] font-extrabold leading-[1.2] tracking-tight text-[#1A1A1A]">
          {HEADLINE}
        </h1>

        {/* Subline – etwas Abstand, gut lesbar, grau */}
        <p className="max-w-xl text-[15px] leading-[1.6] text-[#4A4A4A]">
          {SUBLINE}
        </p>

        {/* 3 Nutzen-Cards – gestapelt, wie Figma: weicher Schatten, dezente Tönung */}
        <ul className="flex flex-col gap-5" role="list">
          {CARDS.map((card) => (
            <li key={card.title}>
              <div
                className={`flex items-center gap-4 rounded-xl border ${card.borderClass} ${card.bgClass} px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
                  aria-hidden
                >
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800">{card.title}</p>
                  <p className="mt-0.5 text-[13px] font-normal leading-snug text-slate-600">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

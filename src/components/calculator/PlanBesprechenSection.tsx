"use client";

import { ConsultationLeadForm } from "@/components/calculator/ConsultationLeadForm";

const DEFAULT_BOOKING_URL: string | null = null;

export function PlanBesprechenSection({
  bookingUrl = DEFAULT_BOOKING_URL,
}: {
  bookingUrl?: string | null;
}) {
  return (
    <section
      id="plan-besprechen"
      className="rounded-3xl bg-white px-4 py-5 shadow-sm shadow-slate-900/5"
      aria-label="Deinen persönlichen Plan besprechen"
    >
      <div className="flex flex-col gap-2">
        <h2 className="typo-a1 text-slate-900">
          Deinen persönlichen Plan besprechen
        </h2>
        <p className="typo-a2 text-slate-500">
          In einem kostenfreien Gespräch schauen wir gemeinsam, welche
          Möglichkeiten du hast, passend zu deiner Situation die geplanten
          Lebensschritte für dein Kind realistisch finanzierbar zu machen.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {/* Bereich 1: Booking */}
        <div className="rounded-2xl border border-muted bg-background px-4 py-4">
          <div className="flex flex-col gap-3">
            {bookingUrl ? (
              <a
                href={bookingUrl}
                className="inline-flex w-full items-center justify-center rounded-full bg-primary-action px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1a4a75] focus:outline-none focus:ring-2 focus:ring-primary-action focus:ring-offset-2"
              >
                Kostenfreien Termin auswählen
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-primary-action/40 px-6 py-3 text-sm font-semibold text-white/90"
              >
                Kostenfreien Termin auswählen
              </button>
            )}
          </div>
        </div>

        {/* Bereich 2: Formular */}
        <div className="rounded-2xl border border-muted bg-background px-4 py-4">
          <ConsultationLeadForm
            trustHint="Ich melde mich persönlich bei dir."
            context="Kinder-Investment-Rechner Anfrage"
          />
        </div>
      </div>
    </section>
  );
}


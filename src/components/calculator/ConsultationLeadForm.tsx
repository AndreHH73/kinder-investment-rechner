"use client";

import { useMemo, useState } from "react";

export type ConsultationLeadFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof ConsultationLeadFormValues, string>>;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ConsultationLeadForm({
  trustHint = "Ich melde mich persönlich bei dir.",
  context = "Kinder-Investment-Rechner Anfrage",
}: {
  trustHint?: string;
  context?: string;
}) {
  const [values, setValues] = useState<ConsultationLeadFormValues>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return (
      values.name.trim().length > 0 &&
      values.email.trim().length > 0 &&
      values.phone.trim().length > 0 &&
      isValidEmail(values.email.trim())
    );
  }, [values.email, values.name, values.phone]);

  const validate = (v: ConsultationLeadFormValues): FieldErrors => {
    const next: FieldErrors = {};
    if (!v.name.trim()) next.name = "Bitte gib deinen Namen an.";
    if (!v.email.trim()) next.email = "Bitte gib deine E-Mail an.";
    else if (!isValidEmail(v.email.trim()))
      next.email = "Bitte gib eine gültige E-Mail-Adresse an.";
    if (!v.phone.trim()) next.phone = "Bitte gib deine Telefonnummer an.";
    return next;
  };

  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        const nextErrors = validate(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name.trim(),
              email: values.email.trim(),
              phone: values.phone.trim(),
              message: values.message.trim(),
              context,
            }),
          });
          const data = (await res.json()) as
            | { ok: true }
            | { ok: false; message?: string; fieldErrors?: Record<string, string> };

          if (!res.ok || !("ok" in data) || data.ok === false) {
            if (data && "fieldErrors" in data && data.fieldErrors) {
              setErrors((prev) => ({
                ...prev,
                ...(data.fieldErrors as FieldErrors),
              }));
            }
            setSubmitError(
              ("message" in data && data.message) ||
                "Das hat leider nicht geklappt. Bitte versuche es erneut.",
            );
            return;
          }

          setSubmitSuccess(true);
          setValues({ name: "", email: "", phone: "", message: "" });
          setErrors({});
        } catch {
          setSubmitError(
            "Das hat leider nicht geklappt. Bitte prüfe deine Verbindung und versuche es erneut.",
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div>
        <label className="typo-a4-medium block text-foreground">
          Name <span className="text-rose-500">*</span>
        </label>
        <input
          value={values.name}
          onChange={(e) => {
            const next = e.target.value;
            setValues((p) => ({ ...p, name: next }));
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="mt-1 text-[12px] text-rose-600">{errors.name}</p>
        )}
      </div>
      <div>
        <label className="typo-a4-medium block text-foreground">
          E-Mail <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => {
            const next = e.target.value;
            setValues((p) => ({ ...p, email: next }));
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && (
          <p className="mt-1 text-[12px] text-rose-600">{errors.email}</p>
        )}
      </div>
      <div>
        <label className="typo-a4-medium block text-foreground">
          Telefonnummer <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => {
            const next = e.target.value;
            setValues((p) => ({ ...p, phone: next }));
            if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
          }}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          autoComplete="tel"
          required
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && (
          <p className="mt-1 text-[12px] text-rose-600">{errors.phone}</p>
        )}
      </div>
      <div>
        <label className="typo-a4-medium block text-foreground">
          Noch etwas, das ich wissen sollte?{" "}
          <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          value={values.message}
          onChange={(e) =>
            setValues((p) => ({ ...p, message: e.target.value }))
          }
          rows={3}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`mt-1 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-action focus:ring-offset-2 ${
          isValid && !isSubmitting
            ? "bg-primary-action text-white hover:bg-[#1a4a75]"
            : "cursor-not-allowed bg-primary-action/40 text-white/90"
        }`}
      >
        {isSubmitting ? "Wird gesendet…" : "Kostenfrei anfragen"}
      </button>
      {submitSuccess && (
        <p className="typo-a4 text-emerald-700">
          Danke, ich melde mich zeitnah bei dir.
        </p>
      )}
      {submitError && (
        <p className="typo-a4 text-rose-600">{submitError}</p>
      )}
      <p className="typo-a4 text-slate-500">{trustHint}</p>
    </form>
  );
}


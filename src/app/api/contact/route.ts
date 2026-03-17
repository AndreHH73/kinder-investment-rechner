import { Resend } from "resend";
import { NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message?: string;
  context?: string;
};

function isValidEmail(email: string) {
  // Pragmatic check (server-side): enough to catch obvious typos.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ContactPayload>;

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const message = (body.message ?? "").trim();
    const context = (body.context ?? "Kinder-Investment-Rechner Anfrage").trim();

    const fieldErrors: Record<string, string> = {};
    if (!name) fieldErrors.name = "Bitte gib deinen Namen an.";
    if (!email) fieldErrors.email = "Bitte gib deine E-Mail an.";
    else if (!isValidEmail(email))
      fieldErrors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
    if (!phone) fieldErrors.phone = "Bitte gib deine Telefonnummer an.";

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { ok: false, message: "Bitte prüfe deine Angaben.", fieldErrors },
        { status: 400 },
      );
    }

    const receiver = process.env.CONTACT_FORM_RECEIVER_EMAIL;
    const fromEmail =
      process.env.CONTACT_FORM_FROM_EMAIL ?? "hallo@mail.4futurefamily.de";
    const resendKey = process.env.RESEND_API_KEY;

    if (!receiver) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "CONTACT_FORM_RECEIVER_EMAIL ist nicht gesetzt. Bitte im Environment konfigurieren.",
        },
        { status: 500 },
      );
    }
    if (!resendKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "RESEND_API_KEY ist nicht gesetzt. Bitte im Environment konfigurieren.",
        },
        { status: 500 },
      );
    }

    const resend = new Resend(resendKey);
    const timestamp = new Date().toISOString();

    const text = [
      context,
      "",
      `Zeitpunkt: ${timestamp}`,
      "",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone}`,
      `Nachricht: ${message || "-"}`,
    ].join("\n");

    const subject = `${context} – neue Anfrage`;

    const { error } = await resend.emails.send({
      from: `4futurefamily <${fromEmail}>`,
      to: receiver,
      replyTo: email,
      subject,
      text,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "Versand fehlgeschlagen. Bitte versuche es erneut." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Ungültige Anfrage. Bitte versuche es erneut." },
      { status: 400 },
    );
  }
}


import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
    // TEMP local diagnostics (no secrets, only booleans)
    // eslint-disable-next-line no-console
    console.log("[contact] cwd:", process.cwd());
    // eslint-disable-next-line no-console
    console.log(
      "[contact] env present:",
      JSON.stringify({
        receiver: !!process.env.CONTACT_FORM_RECEIVER_EMAIL,
        from: !!process.env.CONTACT_FORM_FROM_EMAIL,
        resendKey: !!process.env.RESEND_API_KEY,
      }),
    );

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
    const fromEmailEnv = process.env.CONTACT_FORM_FROM_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;

    const fromEmail = fromEmailEnv ?? "hallo@mail.4futurefamily.de";

    if (!receiver || !resendKey) {
      const missing = {
        receiverMissing: !receiver,
        fromMissing: !fromEmailEnv,
        resendKeyMissing: !resendKey,
      };

      if (!receiver) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "CONTACT_FORM_RECEIVER_EMAIL ist nicht gesetzt. Bitte im Environment konfigurieren.",
            missing,
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
            missing,
          },
          { status: 500 },
        );
      }
    }

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

    const { data, error } = await resend.emails.send({
      from: `4futurefamily <${fromEmail}>`,
      to: receiver,
      replyTo: email,
      subject,
      text,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[contact] resend send failed", {
        message: (error as any)?.message,
        name: (error as any)?.name,
        statusCode: (error as any)?.statusCode,
        // Helpful context, no secrets:
        receiverPresent: Boolean(receiver),
        fromPresent: Boolean(fromEmailEnv),
        fromUsed: fromEmail,
        replyToPresent: Boolean(email),
        resendId: (data as any)?.id,
      });

      const errorMessage = String((error as any)?.message ?? "");
      const diagnosis =
        errorMessage.toLowerCase().includes("domain") ||
        errorMessage.toLowerCase().includes("verify") ||
        errorMessage.toLowerCase().includes("verified")
          ? "domain not verified"
          : errorMessage.toLowerCase().includes("from")
            ? "invalid from address"
            : errorMessage.toLowerCase().includes("api key") ||
                errorMessage.toLowerCase().includes("unauthorized")
              ? "api error"
              : "resend send failed";

      return NextResponse.json(
        {
          ok: false,
          message: "Versand fehlgeschlagen. Bitte versuche es erneut.",
          diagnosis,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[contact] handler error", {
      message: (err as any)?.message,
      name: (err as any)?.name,
    });
    return NextResponse.json(
      {
        ok: false,
        message: "Ungültige Anfrage. Bitte versuche es erneut.",
        diagnosis: "handler error",
      },
      { status: 400 },
    );
  }
}


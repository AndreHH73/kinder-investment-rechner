export async function trackEvent(
  token: string,
  eventName: string,
  eventData?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch("https://4futurefamily-web.vercel.app/api/pinguin/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, eventName, eventData }),
    });
  } catch {
    // fail silently
  }
}

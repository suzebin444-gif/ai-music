import { cookies } from "next/headers";

export const SESSION_COOKIE = "sqmusic_sid";

export async function getOrCreateSessionId(): Promise<{
  sessionId: string;
  isNew: boolean;
}> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) {
    return { sessionId: existing, isNew: false };
  }

  const sessionId = crypto.randomUUID();
  jar.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return { sessionId, isNew: true };
}

export async function getSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

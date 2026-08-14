import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken, type SessionPayload } from "./auth";
import type { Role } from "./validation";

/** Reads and verifies the session cookie. Safe to call from Server
 * Components, Server Actions, and Route Handlers. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

type RequireSessionResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

/**
 * Route-handler guard: verifies the caller is signed in and, if roles are
 * given, that their role is allowed. Returns a ready-to-return NextResponse
 * on failure so handlers can `if (!auth.ok) return auth.response;`.
 */
export async function requireSession(allowedRoles?: Role[]): Promise<RequireSessionResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "You need to sign in to do that." }, { status: 401 }),
    };
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Your role doesn't have permission to do that." },
        { status: 403 }
      ),
    };
  }
  return { ok: true, session };
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { portalRegisterSchema, firstZodMessage } from "@/lib/validation";
import { registerUser, EmailInUseError } from "@/lib/register";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

/** Fleet Manager self-registration via the secret portal URL. Mirrors
 * register-admin/route.ts — see the comment there for the security
 * rationale of re-checking the portal path server-side. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = portalRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
    }

    const managerPath = process.env.MANAGER_PORTAL_PATH;
    if (!managerPath || parsed.data.portalPath !== managerPath) {
      return NextResponse.json({ error: "Invalid or expired registration link." }, { status: 403 });
    }

    const { user, token } = await registerUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: "MANAGER",
      status: "ACTIVE",
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    await recordAudit(String(user._id), "MANAGER_SIGNUP", `${user.email} registered via manager portal`);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailInUseError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[auth/register-manager]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

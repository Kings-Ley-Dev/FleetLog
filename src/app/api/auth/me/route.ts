import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getSession, requireSession } from "@/lib/session";
import { serializeUser } from "@/lib/serializers";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { firstZodMessage } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  await connectDB();
  const user = await User.findById(session.sub);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: serializeUser(user) });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

/** Self-service password change — the only way a signed-in user can touch
 * their own credentials (the admin /api/users/[id] route deliberately
 * blocks self-edits so an admin can't silently lock themselves out or
 * escalate their own role unnoticed). */
export async function PATCH(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(auth.session.sub).select("+password");
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  user.password = await hashPassword(parsed.data.newPassword);
  await user.save();
  await recordAudit(auth.session.sub, "PASSWORD_CHANGED", user.email);

  return NextResponse.json({ ok: true });
}

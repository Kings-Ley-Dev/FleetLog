import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireSession } from "@/lib/session";
import { userUpdateSchema, firstZodMessage } from "@/lib/validation";
import { serializeUser } from "@/lib/serializers";
import { hashPassword } from "@/lib/auth";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageDrivers(auth.session.role)) {
    return NextResponse.json({ error: "Manager or admin access only." }, { status: 403 });
  }

  const { id } = await params;
  if (id === auth.session.sub) {
    return NextResponse.json(
      { error: "You can't change your own role or status from here." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  await connectDB();
  const target = await User.findById(id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Managers are scoped to driver accounts only, and can never grant a
  // role — that stays an admin-only, portal-gated action.
  if (auth.session.role === "MANAGER") {
    if (target.role !== "DRIVER") {
      return NextResponse.json({ error: "You can only manage driver accounts." }, { status: 403 });
    }
    if (data.role) {
      return NextResponse.json({ error: "Only an admin can change a user's role." }, { status: 403 });
    }
  }

  const update: Record<string, unknown> = {};
  if (data.name) update.name = data.name;
  if (data.role) update.role = data.role;
  if (data.status) update.status = data.status;
  if (data.password) update.password = await hashPassword(data.password);

  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const action = data.status === "ACTIVE" && target.status === "PENDING" ? "USER_APPROVED" : "USER_UPDATED";
  await recordAudit(auth.session.sub, action, user.email);
  return NextResponse.json({ user: serializeUser(user) });
}

/** Removes a user outright — used to reject a pending driver signup, or
 * to remove a driver account entirely. Admins may delete anyone but
 * themselves; managers may only delete drivers. */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageDrivers(auth.session.role)) {
    return NextResponse.json({ error: "Manager or admin access only." }, { status: 403 });
  }

  const { id } = await params;
  if (id === auth.session.sub) {
    return NextResponse.json({ error: "You can't remove your own account." }, { status: 400 });
  }

  await connectDB();
  const target = await User.findById(id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (auth.session.role === "MANAGER" && target.role !== "DRIVER") {
    return NextResponse.json({ error: "You can only manage driver accounts." }, { status: 403 });
  }

  await User.findByIdAndDelete(id);
  await recordAudit(auth.session.sub, "USER_REMOVED", target.email);
  return NextResponse.json({ ok: true });
}

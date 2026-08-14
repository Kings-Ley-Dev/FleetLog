import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireSession } from "@/lib/session";
import { userCreateSchema, firstZodMessage } from "@/lib/validation";
import { serializeUser } from "@/lib/serializers";
import { hashPassword } from "@/lib/auth";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageDrivers(auth.session.role)) {
    return NextResponse.json({ error: "Manager or admin access only." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = {};

  // Managers only ever see driver accounts — they can't browse admins or
  // other managers, regardless of what a caller puts in the query string.
  if (auth.session.role === "MANAGER") {
    filter.role = "DRIVER";
  } else {
    const role = searchParams.get("role");
    if (role) filter.role = role;
  }

  await connectDB();
  const users = await User.find(filter).sort({ createdAt: -1 });
  return NextResponse.json({ users: users.map(serializeUser) });
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageDrivers(auth.session.role)) {
    return NextResponse.json({ error: "Manager or admin access only." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  // Managers can only ever add drivers directly — creating a manager or
  // admin account requires that role's own portal signup link.
  if (auth.session.role === "MANAGER" && data.role !== "DRIVER") {
    return NextResponse.json({ error: "Fleet managers can only add drivers." }, { status: 403 });
  }

  await connectDB();
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const password = await hashPassword(data.password);
  // Created directly by a manager/admin, not self-signed-up, so it skips
  // the PENDING approval queue.
  const user = await User.create({
    name: data.name,
    email: data.email,
    password,
    role: data.role,
    status: "ACTIVE",
  });
  await recordAudit(auth.session.sub, "USER_CREATED", `${user.email} (${user.role})`);

  return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
}

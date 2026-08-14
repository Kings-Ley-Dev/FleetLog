import { NextResponse } from "next/server";
import { registerSchema, firstZodMessage } from "@/lib/validation";
import { registerUser, EmailInUseError } from "@/lib/register";
import { recordAudit } from "@/lib/audit";

/**
 * Public driver/general-user signup. Always creates role=DRIVER with
 * status=PENDING — new drivers need a manager or admin to approve them
 * before they can sign in (see /api/auth/login's PENDING check).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
    }

    const { user } = await registerUser({
      ...parsed.data,
      role: "DRIVER",
      status: "PENDING",
    });

    await recordAudit(String(user._id), "DRIVER_SIGNUP", `${user.email} requested access`);

    return NextResponse.json({ pending: true }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailInUseError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[auth/register]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

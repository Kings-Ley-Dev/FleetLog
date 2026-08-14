import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, signSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { loginSchema, firstZodMessage } from "@/lib/validation";
import { serializeUser } from "@/lib/serializers";
import { recordAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
    }
    const { email, password } = parsed.data;

    await connectDB();
    const user = await User.findOne({ email }).select("+password");

    // Constant-shaped response whether the email exists or not, to avoid
    // leaking which accounts are registered.
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "DISABLED") {
      return NextResponse.json(
        { error: "This account has been disabled. Contact your system admin." },
        { status: 403 }
      );
    }

    if (user.status === "PENDING") {
      return NextResponse.json(
        {
          error:
            "Your account is still awaiting approval from a fleet manager or admin. Please check back soon.",
        },
        { status: 403 }
      );
    }

    const token = await signSessionToken({
      sub: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours, matches token TTL
    });

    await recordAudit(String(user._id), "LOGIN", `${user.email} signed in`);

    return NextResponse.json({ user: serializeUser(user) }, { status: 200 });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

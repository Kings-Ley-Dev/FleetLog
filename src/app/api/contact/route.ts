import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { contactMessageSchema, firstZodMessage } from "@/lib/validation";

/** Public support/contact form submission — no auth required. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
    }

    await connectDB();
    await ContactMessage.create(parsed.data);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

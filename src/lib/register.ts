import "server-only";
import connectDB from "./db";
import User from "@/models/User";
import { hashPassword, signSessionToken } from "./auth";
import type { Role } from "./validation";

export class EmailInUseError extends Error {
  constructor() {
    super("An account with that email already exists.");
  }
}

/**
 * Creates a user with a server-decided role/status (never taken from the
 * client) and, for roles that don't need approval, signs a session token
 * ready to be set as a cookie by the calling route handler.
 */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "ACTIVE" | "PENDING";
}) {
  await connectDB();

  const existing = await User.findOne({ email: input.email });
  if (existing) throw new EmailInUseError();

  const password = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    password,
    role: input.role,
    status: input.status,
  });

  const token =
    input.status === "ACTIVE"
      ? await signSessionToken({
          sub: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        })
      : null;

  return { user, token };
}

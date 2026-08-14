import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/session";
import { serializeUser } from "@/lib/serializers";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const dbUser = await User.findById(session.sub);
  if (!dbUser || dbUser.status !== "ACTIVE") redirect("/login");

  return <DashboardShell user={serializeUser(dbUser)}>{children}</DashboardShell>;
}

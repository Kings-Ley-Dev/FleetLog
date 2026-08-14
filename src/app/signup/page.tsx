import Link from "next/link";
import { Fuel, Gauge, ShieldCheck, TrendingDown } from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { EfficiencyGauge } from "@/components/charts/EfficiencyGauge";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-obsidian px-12 py-10 text-white lg:flex">
        <Link href="/">
          <Logo dark />
        </Link>

        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            Join your fleet
            <br />
            on FleetLog.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Create your driver account below. A fleet manager or admin will approve it, then
            you&apos;re ready to start logging fuel in seconds.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <EfficiencyGauge value={9.6} size={180} dark />
          </div>

          <ul className="mt-8 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2.5">
              <Fuel className="size-4 text-mint" /> Log fuel in under 30 seconds
            </li>
            <li className="flex items-center gap-2.5">
              <Gauge className="size-4 text-mint" /> Real-time km/L efficiency
            </li>
            <li className="flex items-center gap-2.5">
              <TrendingDown className="size-4 text-mint" /> Spot rising cost-per-km early
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-mint" /> Role-based access for every team
            </li>
          </ul>
        </div>

        <div />
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-slate">Sign up as a driver to start logging fuel.</p>

          <div className="mt-6">
            <RegisterForm mode="driver" endpoint="/api/auth/register" />
          </div>

          <p className="mt-6 text-center text-sm text-slate">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate">
            <Link href="/" className="font-medium text-emerald hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

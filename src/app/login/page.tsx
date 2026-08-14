import { Suspense } from "react";
import Link from "next/link";
import { Fuel, Gauge, ShieldCheck, TrendingDown } from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { EfficiencyGauge } from "@/components/charts/EfficiencyGauge";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-obsidian px-12 py-10 text-white lg:flex">
        <Link href="/">
          <Logo dark />
        </Link>

        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            Track every fill-up.
            <br />
            Cut every cost.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            FleetLog gives Ghanaian transport operators one place to log fuel, watch
            efficiency, and stay ahead of maintenance down to the last cedi.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <EfficiencyGauge value={12.4} size={180} dark />
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
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-slate">Sign in to your FleetLog account.</p>

          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-sm text-slate">
            New driver?{" "}
            <Link href="/signup" className="font-medium text-emerald hover:underline">
              Create an account
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

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { EfficiencyGauge } from "@/components/charts/EfficiencyGauge";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { cn } from "@/lib/utils";

interface PortalViewProps {
  role: "ADMIN" | "MANAGER";
  title: string;
  tagline: string;
  portalPath: string;
}

export function PortalView({ role, title, tagline, portalPath }: PortalViewProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const endpoint = role === "ADMIN" ? "/api/auth/register-admin" : "/api/auth/register-manager";
  const roleName = role === "ADMIN" ? "System Admin" : "Fleet Manager";

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-obsidian px-12 py-10 text-white lg:flex">
        <Link href="/">
          <Logo dark />
        </Link>

        <div className="max-w-sm">
          <p className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mint">
            {title}
          </p>
          <p className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            {roleName} access
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">{tagline}</p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <EfficiencyGauge value={14.2} size={180} dark />
          </div>
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

          <div className="mb-6 inline-flex rounded-xl border border-line bg-panel p-1">
            <button
              onClick={() => setTab("signin")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                tab === "signin" ? "bg-obsidian text-white" : "text-slate hover:text-ink"
              )}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                tab === "signup" ? "bg-obsidian text-white" : "text-slate hover:text-ink"
              )}
            >
              Create account
            </button>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            {tab === "signin" ? `${roleName} sign in` : `Create a ${roleName} account`}
          </h1>
          <p className="mt-1 text-sm text-slate">
            {tab === "signin"
              ? "Sign in to your FleetLog account."
              : "Gain access to control the system." }
          </p>

          <div className="mt-6">
            {tab === "signin" ? (
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            ) : (
              <RegisterForm mode="portal" endpoint={endpoint} portalPath={portalPath} />
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate">
            <Link href="/" className="font-medium text-emerald hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

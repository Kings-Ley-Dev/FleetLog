"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { LogoMark } from "@/components/icons/Logo";
import { UserProvider } from "@/components/layout/UserContext";
import { navForRole } from "@/lib/nav";
import { roleLabel } from "@/lib/rbac";
import { initials, cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import type { UserDTO } from "@/types";

export function DashboardShell({ user, children }: { user: UserDTO; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const items = navForRole(user.role);

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navList = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-mint" : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <UserProvider user={user}>
    <div className="min-h-dvh bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-obsidian py-6 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-6" aria-label="FleetLog home">
          <LogoMark />
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
            FleetLog
          </span>
        </Link>
        <div className="mt-8 flex-1">{navList}</div>
        <div className="mx-3 mt-4 rounded-xl bg-white/5 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint text-xs font-bold text-obsidian">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50">{roleLabel(user.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar + slide-over */}
      <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="FleetLog home">
          <LogoMark className="size-7" />
          <span className="font-[family-name:var(--font-display)] text-base font-bold text-ink">FleetLog</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-ink hover:bg-cream cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-obsidian/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-obsidian py-6 shadow-xl">
            <div className="flex items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)} aria-label="FleetLog home">
                <LogoMark />
                <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                  FleetLog
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 cursor-pointer"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-8 flex-1">{navList}</div>
            <div className="mx-3 mt-4 rounded-xl bg-white/5 p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint text-xs font-bold text-obsidian">
                  {initials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-white/50">{roleLabel(user.role)}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
    </UserProvider>
  );
}

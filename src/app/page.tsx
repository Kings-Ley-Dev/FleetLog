import Link from "next/link";
import {
  Fuel,
  Gauge,
  Wrench,
  BarChart3,
  ShieldCheck,
  Car,
  Wallet,
  Droplets,
  Route,
  ArrowRight,
  ClipboardList,
  LineChart,
  Users,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EfficiencyGauge } from "@/components/charts/EfficiencyGauge";

const FEATURES = [
  {
    icon: Fuel,
    title: "Fuel logging that does the math",
    description:
      "Enter odometer, liters, and cost, FleetLog instantly calculates distance, km/L, and cost per kilometre.",
  },
  {
    icon: Wrench,
    title: "Maintenance, on schedule",
    description:
      "Log services against the right vehicle and know exactly when the next one is due, before it becomes a breakdown.",
  },
  {
    icon: BarChart3,
    title: "Fleet-wide analytics",
    description:
      "Spend trends, per-vehicle efficiency, and top fuel stations, all in one dashboard for managers and admins.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in role security",
    description:
      "Drivers, fleet managers, and system admins each see exactly what they need, no more, no less.",
  },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Log a fill-up",
    description: "A driver records liters, cost, and station in under 30 seconds from any device.",
  },
  {
    icon: Gauge,
    title: "FleetLog does the math",
    description: "Distance, km/L efficiency, and cost-per-km are calculated instantly and stored against the vehicle.",
  },
  {
    icon: LineChart,
    title: "Managers see the full picture",
    description: "Spend trends, efficiency dips, and maintenance due-dates surface automatically on the dashboard.",
  },
];

const ROLES = [
  {
    icon: Car,
    title: "Driver",
    description: "Log fuel purchases in seconds and track your own efficiency history.",
    points: ["Log fuel for assigned vehicles", "View personal fuel history", "See vehicle list at a glance"],
  },
  {
    icon: Users,
    title: "Fleet Manager",
    description: "Run day-to-day fleet operations without digging through spreadsheets.",
    points: ["Manage vehicles & assignments", "Track maintenance schedules", "View fleet-wide analytics"],
  },
  {
    icon: ShieldCheck,
    title: "System Admin",
    description: "Full oversight of accounts, roles, and system activity.",
    points: ["Create & manage user accounts", "Assign and change roles", "Review the audit log"],
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-obsidian px-4 pb-20 pt-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mint">
              Fleet & Fuel Management
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl">
              Every liter, every cedi,
              <br />
              & every kilometre tracked.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
              FleetLog helps Ghanaian transport operators log fuel, monitor efficiency, and stay
              ahead of vehicle maintenance in one simple, fast dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login">
                <Button size="lg">
                  Sign in <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:border-mint hover:text-mint">
                  See how it works
                </Button>
              </a>
            </div>
          </div>

          {/* Product preview card */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between">
                <p className="font-[family-name:var(--font-display)] text-sm font-bold text-white">Fleet overview</p>
                <span className="rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-semibold text-mint">Live</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-white/5 p-3">
                  <Wallet className="size-4 text-mint" />
                  <p className="tabular mt-2 text-sm font-semibold text-white">GHS 4,820</p>
                  <p className="text-[10px] text-white/50">Total spend</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <Droplets className="size-4 text-mint" />
                  <p className="tabular mt-2 text-sm font-semibold text-white">612 L</p>
                  <p className="text-[10px] text-white/50">Liters</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <Route className="size-4 text-mint" />
                  <p className="tabular mt-2 text-sm font-semibold text-white">7,340 km</p>
                  <p className="text-[10px] text-white/50">Distance</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white/5 p-3">
                <EfficiencyGauge value={11.8} size={200} dark />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-cream px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
              Why fleet operators choose FleetLog
            </h2>
            <p className="mt-3 text-slate">
              Purpose-built for the way small and mid-size transport fleets actually operate.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-obsidian px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">How it works</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-mint">
            From fill-up to full visibility
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="tabular text-xs font-semibold text-mint">{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-3 flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <s.icon className="size-5 text-mint" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-cream px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">Built for your whole team</h2>
            <p className="mt-3 text-slate">Every role gets exactly the view it needs and nothing more.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {ROLES.map((r) => (
              <Card key={r.title} className="p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-obsidian text-mint">
                  <r.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-ink">{r.title}</h3>
                <p className="mt-1.5 text-sm text-slate">{r.description}</p>
                <ul className="mt-4 space-y-2">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-obsidian px-4 py-20 text-center text-white sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Ready to get your fleet under control?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/60">
          Sign in with your FleetLog account to start logging fuel and tracking efficiency today.
        </p>
        <Link href="/login" className="mt-8 inline-block">
          <Button size="lg">
            Sign in <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}

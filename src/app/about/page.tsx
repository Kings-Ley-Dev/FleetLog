import type { Metadata } from "next";
import Link from "next/link";
import { Fuel, Wrench, BarChart3, ShieldCheck, ArrowRight, Target, Users2 } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About",
  description: "Why FleetLog exists and what it does for transport operators in Ghana.",
};

const WHAT_WE_DO = [
  {
    icon: Fuel,
    title: "Fuel logging that does the math",
    description: "Every fill-up instantly turns into distance, km/L efficiency, and cost-per-km, no spreadsheets required.",
  },
  {
    icon: Wrench,
    title: "Maintenance you won't forget",
    description: "Service records live against the vehicle, with due-odometer reminders before small issues become breakdowns.",
  },
  {
    icon: BarChart3,
    title: "Answers, not just data",
    description: "Fleet-wide spend trends, per-vehicle efficiency, and top fuel stations, ready for a manager to act on.",
  },
  {
    icon: ShieldCheck,
    title: "The right access for the right person",
    description: "Drivers, fleet managers, and system admins each get exactly the view their role needs.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicNavbar />

      <section className="bg-obsidian px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-mint">About FleetLog</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
            Built for the way fleets actually run
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            FleetLog started with a simple observation: most small and mid-size transport
            operators in Ghana are still tracking fuel and maintenance on paper, or not tracking
            it at all.
          </p>
        </div>
      </section>

      <section className="bg-cream px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-obsidian text-mint">
              <Target className="size-5" />
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Our mission</h2>
            <p className="mt-3 leading-relaxed text-slate">
              Fuel is usually the single biggest running cost for a fleet, and the easiest one to
              lose track of. A missed odometer reading here, a fuel receipt that never makes it
              into a spreadsheet there, and by the end of the month nobody can say for sure where
              the money went, or which vehicle is quietly costing more than it should.
            </p>
            <p className="mt-3 leading-relaxed text-slate">
              FleetLog exists to close that gap: log a fill-up in under a minute, and let the
              efficiency and cost numbers calculate themselves, accurately, every time, for every
              vehicle in the fleet.
            </p>
          </div>

          <div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-obsidian text-mint">
              <Users2 className="size-5" />
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Who it&apos;s for</h2>
            <p className="mt-3 leading-relaxed text-slate">
              Drivers who just need to log a fill-up and get back on the road. Fleet managers
              juggling vehicles, drivers, and maintenance schedules across a growing fleet. System
              admins who need oversight without living inside every workflow. FleetLog gives each
              of them a dashboard built around what they actually need to do.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-obsidian px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-mint">What FleetLog does</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {WHAT_WE_DO.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <f.icon className="size-5 text-mint" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 mt-8 pb-20 text-center sm:px-6 lg:px-8">
        <br /> <br />
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink sm:text-3xl">
          Ready to see it for yourself?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate">
          Create a driver account in a minute, or reach out if you&apos;re setting FleetLog up for your
          fleet.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">
              Get started <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline">
              Contact us
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

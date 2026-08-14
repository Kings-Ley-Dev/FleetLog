import Link from "next/link";
import { Wallet, Droplets, Car, Route, Fuel, MapPin } from "lucide-react";
import { getSession } from "@/lib/session";
import { getFleetAnalytics, getDriverOverview } from "@/lib/queries";
import { permissions } from "@/lib/rbac";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EfficiencyGauge } from "@/components/charts/EfficiencyGauge";
import { SpendTrendChart } from "@/components/charts/SpendTrendChart";
import { VehicleSpendBar } from "@/components/charts/VehicleSpendBar";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatGHS, formatNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) return null;

  if (permissions.viewAnalytics(session.role)) {
    const analytics = await getFleetAnalytics();
    return (
      <div>
        <PageHeader
          title={`Welcome back, ${session.name.split(" ")[0]}`}
          description="Here's how the fleet is running across all vehicles."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total fuel spend"
            value={formatGHS(analytics.totalSpendGHS)}
            icon={Wallet}
            tone="emerald"
          />
          <StatCard
            label="Liters purchased"
            value={`${formatNumber(analytics.totalLiters, 1)} L`}
            icon={Droplets}
            tone="amber"
          />
          <StatCard
            label="Distance logged"
            value={`${formatNumber(analytics.totalDistanceKm)} km`}
            icon={Route}
            tone="obsidian"
          />
          <StatCard
            label="Active vehicles"
            value={String(analytics.activeVehicleCount)}
            icon={Car}
            tone="emerald"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
                Fleet efficiency
              </h3>
            </CardHeader>
            <CardBody className="flex flex-col items-center">
              <EfficiencyGauge value={analytics.averageEfficiencyKmL} />
              <p className="mt-2 text-center text-xs text-slate">
                Fleet-wide average across all logged fill-ups
              </p>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
                Spend trend (last 6 months)
              </h3>
            </CardHeader>
            <CardBody>
              {analytics.monthlySpend.length > 0 ? (
                <SpendTrendChart data={analytics.monthlySpend} />
              ) : (
                <EmptyState icon={Fuel} title="No fuel logs yet" description="Spend trends will appear once fuel logs are recorded." />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
                Spend by vehicle
              </h3>
            </CardHeader>
            <CardBody>
              {analytics.vehicleBreakdown.length > 0 ? (
                <VehicleSpendBar data={analytics.vehicleBreakdown} />
              ) : (
                <EmptyState icon={Car} title="No vehicle data yet" />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
                Top fuel stations
              </h3>
            </CardHeader>
            <CardBody>
              {analytics.topStations.length > 0 ? (
                <ul className="divide-y divide-line">
                  {analytics.topStations.map((s) => (
                    <li key={s.stationName} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-ink">
                        <MapPin className="size-3.5 text-slate-soft" />
                        {s.stationName}
                      </span>
                      <span className="tabular text-slate">{formatGHS(s.totalSpendGHS)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={MapPin} title="No station data yet" />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Driver view: personal fuel-log summary.
  const overview = await getDriverOverview(session.sub);
  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session.name.split(" ")[0]}`}
        description="Your fuel logging summary."
        action={
          <Link href="/dashboard/fuel-logs">
            <Button>
              <Fuel className="size-4" /> Log fuel
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Your total spend" value={formatGHS(overview.totalSpendGHS)} icon={Wallet} tone="emerald" />
        <StatCard label="Liters logged" value={`${formatNumber(overview.totalLiters, 1)} L`} icon={Droplets} tone="amber" />
        <StatCard label="Distance logged" value={`${formatNumber(overview.totalDistanceKm)} km`} icon={Route} tone="obsidian" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">Your efficiency</h3>
          </CardHeader>
          <CardBody className="flex flex-col items-center">
            <EfficiencyGauge value={overview.averageEfficiencyKmL} />
            <p className="mt-2 text-center text-xs text-slate">Average across your {overview.logCount} logged fill-ups</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">Recent fuel logs</h3>
          </CardHeader>
          <CardBody>
            {overview.recentLogs.length > 0 ? (
              <ul className="divide-y divide-line">
                {overview.recentLogs.map((log) => (
                  <li key={log.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{log.vehicle.licensePlate}</p>
                      <p className="text-xs text-slate">
                        {formatDate(log.logDate)} · {log.stationName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-medium text-ink">{formatGHS(log.totalCostGHS)}</p>
                      <p className="tabular text-xs text-slate">{log.fuelEfficiencyKmL} km/L</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Fuel}
                title="No fuel logs yet"
                description="Log your first fill-up to see it here."
                action={
                  <Link href="/dashboard/fuel-logs">
                    <Button size="sm">Log fuel</Button>
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

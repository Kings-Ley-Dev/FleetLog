"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Fuel, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { FuelLogForm } from "@/components/dashboard/FuelLogForm";
import { useUser } from "@/components/layout/UserContext";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { permissions } from "@/lib/rbac";
import { rateEfficiency } from "@/lib/calculations";
import { formatGHS, formatDate } from "@/lib/utils";
import type { FuelLogDTO, VehicleDTO, UserDTO, PaginatedResult } from "@/types";

const effTone = { poor: "rose", fair: "amber", good: "emerald" } as const;

export default function FuelLogsPage() {
  const user = useUser();
  const canManage = permissions.viewAllFuelLogs(user.role);
  const { push } = useToast();

  const [result, setResult] = useState<PaginatedResult<FuelLogDTO> | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [drivers, setDrivers] = useState<UserDTO[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<FuelLogDTO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (vehicleFilter) params.set("vehicleId", vehicleFilter);
      const res = await apiFetch<PaginatedResult<FuelLogDTO>>(`/api/fuel-logs?${params}`);
      setResult(res);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not load fuel logs.", "error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() awaits before setState; standard client fetch-on-mount pattern
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, vehicleFilter]);

  useEffect(() => {
    apiFetch<{ vehicles: VehicleDTO[] }>("/api/vehicles?status=ACTIVE")
      .then((res) => setVehicles(res.vehicles))
      .catch(() => {});
    if (canManage) {
      apiFetch<{ users: UserDTO[] }>("/api/users?role=DRIVER")
        .then((res) => setDrivers(res.users))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCreated(log: FuelLogDTO) {
    setFormOpen(false);
    push("Fuel log saved.");
    setPage(1);
    load();
    // Keep the vehicle's odometer fresh for the next entry's "last recorded" hint.
    setVehicles((prev) =>
      prev.map((v) => (v.id === log.vehicle.id ? { ...v, currentOdometer: log.currentOdometer } : v))
    );
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/fuel-logs/${deleting.id}`, { method: "DELETE" });
      push("Fuel log deleted.");
      setDeleting(null);
      load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not delete fuel log.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Fuel Logs"
        description={canManage ? "All fuel purchases recorded across the fleet." : "Your logged fuel purchases."}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Log fuel
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={vehicleFilter} onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }}>
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.licensePlate}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {result === null ? (
          <Spinner />
        ) : result.items.length === 0 ? (
          <EmptyState
            icon={Fuel}
            title="No fuel logs yet"
            description="Log a fill-up to start tracking efficiency and spend."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" /> Log fuel
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Vehicle</th>
                    {canManage && <th className="px-5 py-3">Driver</th>}
                    <th className="px-5 py-3">Liters</th>
                    <th className="px-5 py-3">Cost</th>
                    <th className="px-5 py-3">Efficiency</th>
                    <th className="px-5 py-3">Station</th>
                    {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.items.map((log) => (
                    <tr key={log.id} className="hover:bg-cream/60">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate">{formatDate(log.logDate)}</td>
                      <td className="px-5 py-3.5">
                        <p className="tabular font-semibold text-ink">{log.vehicle.licensePlate}</p>
                        <p className="text-xs text-slate">
                          {log.vehicle.make} {log.vehicle.model}
                        </p>
                      </td>
                      {canManage && <td className="px-5 py-3.5 text-slate">{log.driver.name}</td>}
                      <td className="tabular px-5 py-3.5 text-ink">{log.litersPurchased} L</td>
                      <td className="tabular px-5 py-3.5 text-ink">{formatGHS(log.totalCostGHS)}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={effTone[rateEfficiency(log.fuelEfficiencyKmL)]}>
                          {log.fuelEfficiencyKmL} km/L
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate">{log.stationName}</td>
                      {canManage && (
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setDeleting(log)}
                            className="rounded-lg p-2 text-slate hover:bg-rose-soft hover:text-rose cursor-pointer"
                            aria-label="Delete log"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-3.5 text-sm text-slate">
              <span>
                Page {result.page} of {result.totalPages} · {result.total} logs
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={result.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-line p-1.5 disabled:opacity-40 hover:bg-cream cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  disabled={result.page >= result.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-line p-1.5 disabled:opacity-40 hover:bg-cream cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Log fuel purchase" size="lg">
        <FuelLogForm vehicles={vehicles} drivers={canManage ? drivers : undefined} onSuccess={handleCreated} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this fuel log?"
        description="This removes the entry from reporting. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  );
}

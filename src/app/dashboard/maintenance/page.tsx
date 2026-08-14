"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wrench, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { MaintenanceForm } from "@/components/dashboard/MaintenanceForm";
import { useUser } from "@/components/layout/UserContext";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { permissions } from "@/lib/rbac";
import { formatGHS, formatDate, formatNumber } from "@/lib/utils";
import type { MaintenanceDTO, VehicleDTO } from "@/types";

export default function MaintenancePage() {
  const user = useUser();
  const canManage = permissions.manageMaintenance(user.role);
  const { push } = useToast();
  const [records, setRecords] = useState<MaintenanceDTO[] | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceDTO | undefined>(undefined);
  const [deleting, setDeleting] = useState<MaintenanceDTO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    try {
      const res = await apiFetch<{ items: MaintenanceDTO[] }>("/api/maintenance");
      setRecords(res.items);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not load maintenance records.", "error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async load(); setState happens after an await
    load();
    apiFetch<{ vehicles: VehicleDTO[] }>("/api/vehicles")
      .then((res) => setVehicles(res.vehicles))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(r: MaintenanceDTO) {
    setEditing(r);
    setFormOpen(true);
  }
  function handleSuccess(r: MaintenanceDTO) {
    setRecords((prev) => {
      if (!prev) return [r];
      const exists = prev.some((p) => p.id === r.id);
      return exists ? prev.map((p) => (p.id === r.id ? r : p)) : [r, ...prev];
    });
    setFormOpen(false);
    push(editing ? "Maintenance record updated." : "Maintenance logged.");
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/maintenance/${deleting.id}`, { method: "DELETE" });
      setRecords((prev) => prev?.filter((r) => r.id !== deleting.id) ?? null);
      push("Maintenance record deleted.");
      setDeleting(null);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not delete record.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Service history and upcoming maintenance across the fleet."
        action={
          canManage && (
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Log maintenance
            </Button>
          )
        }
      />

      <Card>
        {records === null ? (
          <Spinner />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No maintenance records yet"
            description="Log a service to start tracking upkeep costs and due dates."
            action={
              canManage && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="size-4" /> Log maintenance
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Cost</th>
                  <th className="px-5 py-3">Next due</th>
                  {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {records.map((r) => {
                  const dueSoon =
                    r.nextDueOdometer != null &&
                    vehicles.find((v) => v.id === r.vehicle.id)?.currentOdometer !== undefined &&
                    r.nextDueOdometer - (vehicles.find((v) => v.id === r.vehicle.id)?.currentOdometer ?? 0) < 500;
                  return (
                    <tr key={r.id} className="hover:bg-cream/60">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate">{formatDate(r.serviceDate)}</td>
                      <td className="px-5 py-3.5">
                        <p className="tabular font-semibold text-ink">{r.vehicle.licensePlate}</p>
                        <p className="text-xs text-slate">
                          {r.vehicle.make} {r.vehicle.model}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-ink">{r.serviceType}</td>
                      <td className="tabular px-5 py-3.5 text-ink">{formatGHS(r.costGHS)}</td>
                      <td className="px-5 py-3.5">
                        {r.nextDueOdometer ? (
                          <Badge tone={dueSoon ? "amber" : "slate"}>
                            {dueSoon && <AlertTriangle className="size-3" />}
                            {formatNumber(r.nextDueOdometer)} km
                          </Badge>
                        ) : (
                          <span className="text-slate-soft">—</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-lg p-2 text-slate hover:bg-cream hover:text-ink cursor-pointer"
                              aria-label="Edit record"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => setDeleting(r)}
                              className="rounded-lg p-2 text-slate hover:bg-rose-soft hover:text-rose cursor-pointer"
                              aria-label="Delete record"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit maintenance record" : "Log maintenance"}
        size="lg"
      >
        <MaintenanceForm vehicles={vehicles} record={editing} onSuccess={handleSuccess} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this record?"
        description="This maintenance entry will be permanently removed."
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  );
}

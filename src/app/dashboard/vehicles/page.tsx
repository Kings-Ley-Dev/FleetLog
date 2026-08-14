"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Ban, Car, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { useUser } from "@/components/layout/UserContext";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { permissions } from "@/lib/rbac";
import { formatNumber, labelize } from "@/lib/utils";
import type { VehicleDTO, UserDTO } from "@/types";

export default function VehiclesPage() {
  const user = useUser();
  const canManage = permissions.manageVehicles(user.role);
  const { push } = useToast();

  const [vehicles, setVehicles] = useState<VehicleDTO[] | null>(null);
  const [drivers, setDrivers] = useState<UserDTO[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleDTO | undefined>(undefined);
  const [deactivating, setDeactivating] = useState<VehicleDTO | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  async function load() {
    try {
      const res = await apiFetch<{ vehicles: VehicleDTO[] }>("/api/vehicles");
      setVehicles(res.vehicles);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not load vehicles.", "error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async load(); setState happens after an await
    load();
    if (canManage) {
      apiFetch<{ users: UserDTO[] }>("/api/users?role=DRIVER")
        .then((res) => setDrivers(res.users))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(v: VehicleDTO) {
    setEditing(v);
    setFormOpen(true);
  }
  function handleFormSuccess(v: VehicleDTO) {
    setVehicles((prev) => {
      if (!prev) return [v];
      const exists = prev.some((p) => p.id === v.id);
      return exists ? prev.map((p) => (p.id === v.id ? v : p)) : [v, ...prev];
    });
    setFormOpen(false);
    push(editing ? "Vehicle updated." : "Vehicle added to the fleet.");
  }

  async function handleDeactivate() {
    if (!deactivating) return;
    setDeactivateLoading(true);
    try {
      const res = await apiFetch<{ vehicle: VehicleDTO }>(`/api/vehicles/${deactivating.id}`, {
        method: "DELETE",
      });
      setVehicles((prev) => prev?.map((p) => (p.id === res.vehicle.id ? res.vehicle : p)) ?? null);
      push("Vehicle marked inactive.");
      setDeactivating(null);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not deactivate vehicle.", "error");
    } finally {
      setDeactivateLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description={canManage ? "Manage the vehicles in your fleet." : "Vehicles currently in the fleet."}
        action={
          canManage && (
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add vehicle
            </Button>
          )
        }
      />

      <Card>
        {vehicles === null ? (
          <Spinner />
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles yet"
            description="Add your first vehicle to start logging fuel and maintenance."
            action={
              canManage && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="size-4" /> Add vehicle
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Fuel</th>
                  <th className="px-5 py-3">Odometer</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Status</th>
                  {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-cream/60">
                    <td className="px-5 py-3.5">
                      <p className="tabular font-semibold text-ink">{v.licensePlate}</p>
                      <p className="text-xs text-slate">
                        {v.make} {v.model} · {v.year}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate">{labelize(v.fuelType)}</td>
                    <td className="tabular px-5 py-3.5 text-ink">{formatNumber(v.currentOdometer)} km</td>
                    <td className="px-5 py-3.5 text-slate">
                      {v.assignedDriver ? (
                        <span className="flex items-center gap-1.5">
                          <UserIcon className="size-3.5 text-slate-soft" /> {v.assignedDriver.name}
                        </span>
                      ) : (
                        <span className="text-slate-soft">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone(v.status)}>{labelize(v.status)}</Badge>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(v)}
                            className="rounded-lg p-2 text-slate hover:bg-cream hover:text-ink cursor-pointer"
                            aria-label={`Edit ${v.licensePlate}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          {v.status !== "INACTIVE" && (
                            <button
                              onClick={() => setDeactivating(v)}
                              className="rounded-lg p-2 text-slate hover:bg-rose-soft hover:text-rose cursor-pointer"
                              aria-label={`Deactivate ${v.licensePlate}`}
                            >
                              <Ban className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit vehicle" : "Add vehicle"}
        description={editing ? `Update details for ${editing.licensePlate}.` : "Register a new vehicle in the fleet."}
        size="lg"
      >
        <VehicleForm vehicle={editing} drivers={drivers} onSuccess={handleFormSuccess} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        onConfirm={handleDeactivate}
        title="Deactivate vehicle?"
        description={`${deactivating?.licensePlate ?? ""} will be marked inactive and hidden from new fuel logs. Its history is kept for reporting.`}
        confirmLabel="Deactivate"
        danger
        loading={deactivateLoading}
      />
    </div>
  );
}

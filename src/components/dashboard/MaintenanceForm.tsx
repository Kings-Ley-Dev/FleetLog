"use client";

import { useState, type FormEvent } from "react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { VehicleDTO, MaintenanceDTO } from "@/types";

interface MaintenanceFormProps {
  vehicles: VehicleDTO[];
  record?: MaintenanceDTO;
  onSuccess: (record: MaintenanceDTO) => void;
  onCancel: () => void;
}

export function MaintenanceForm({ vehicles, record, onSuccess, onCancel }: MaintenanceFormProps) {
  const isEdit = Boolean(record);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const nextDue = String(form.get("nextDueOdometer") || "");
    const payload = {
      vehicleId: String(form.get("vehicleId") || ""),
      serviceType: String(form.get("serviceType") || ""),
      costGHS: Number(form.get("costGHS") || 0),
      serviceDate: String(form.get("serviceDate") || ""),
      odometerAtService: Number(form.get("odometerAtService") || 0),
      ...(nextDue ? { nextDueOdometer: Number(nextDue) } : {}),
      notes: String(form.get("notes") || ""),
    };

    try {
      const res = isEdit
        ? await apiFetch<{ maintenance: MaintenanceDTO }>(`/api/maintenance/${record!.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch<{ maintenance: MaintenanceDTO }>("/api/maintenance", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSuccess(res.maintenance);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select name="vehicleId" label="Vehicle" defaultValue={record?.vehicle.id ?? vehicles[0]?.id} required>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.licensePlate} — {v.make} {v.model}
          </option>
        ))}
      </Select>

      <Input
        name="serviceType"
        label="Service type"
        defaultValue={record?.serviceType}
        placeholder="Oil change, brake pads, tyre rotation…"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="serviceDate"
          label="Service date"
          type="date"
          defaultValue={record?.serviceDate.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
          required
          mono
        />
        <Input name="costGHS" label="Cost (GHS)" type="number" step="0.01" defaultValue={record?.costGHS} required mono />
        <Input
          name="odometerAtService"
          label="Odometer at service (km)"
          type="number"
          step="0.1"
          defaultValue={record?.odometerAtService}
          required
          mono
        />
        <Input
          name="nextDueOdometer"
          label="Next due odometer (km)"
          type="number"
          step="0.1"
          defaultValue={record?.nextDueOdometer}
          hint="Optional"
          mono
        />
      </div>

      <Textarea name="notes" label="Notes (optional)" defaultValue={record?.notes} placeholder="Parts used, workshop, warranty info…" />

      {error && <p className="text-sm font-medium text-rose">{error}</p>}

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Save changes" : "Log maintenance"}
        </Button>
      </div>
    </form>
  );
}

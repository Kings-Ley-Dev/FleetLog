"use client";

import { useState, type FormEvent } from "react";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { VehicleDTO, UserDTO } from "@/types";

interface VehicleFormProps {
  vehicle?: VehicleDTO;
  drivers: UserDTO[];
  onSuccess: (vehicle: VehicleDTO) => void;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, drivers, onSuccess, onCancel }: VehicleFormProps) {
  const isEdit = Boolean(vehicle);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      licensePlate: String(form.get("licensePlate") || ""),
      make: String(form.get("make") || ""),
      model: String(form.get("model") || ""),
      year: Number(form.get("year")),
      fuelType: String(form.get("fuelType") || "DIESEL"),
      initialOdometer: Number(form.get("initialOdometer") || 0),
      status: String(form.get("status") || "ACTIVE"),
      assignedDriver: String(form.get("assignedDriver") || ""),
    };

    try {
      const res = isEdit
        ? await apiFetch<{ vehicle: VehicleDTO }>(`/api/vehicles/${vehicle!.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch<{ vehicle: VehicleDTO }>("/api/vehicles", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSuccess(res.vehicle);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="licensePlate"
          label="License plate"
          defaultValue={vehicle?.licensePlate}
          placeholder="GR 1234-24"
          required
          className="col-span-2 sm:col-span-1"
        />
        <Select name="fuelType" label="Fuel type" defaultValue={vehicle?.fuelType ?? "DIESEL"} className="col-span-2 sm:col-span-1">
          <option value="DIESEL">Diesel</option>
          <option value="PETROL">Petrol</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ELECTRIC">Electric</option>
        </Select>
        <Input name="make" label="Make" defaultValue={vehicle?.make} placeholder="Toyota" required />
        <Input name="model" label="Model" defaultValue={vehicle?.model} placeholder="Hiace" required />
        <Input
          name="year"
          label="Year"
          type="number"
          defaultValue={vehicle?.year}
          placeholder="2022"
          required
          mono
        />
        <Input
          name="initialOdometer"
          label="Initial odometer (km)"
          type="number"
          step="0.1"
          defaultValue={vehicle?.initialOdometer ?? 0}
          required
          disabled={isEdit}
          hint={isEdit ? "Locked after creation — updates automatically from fuel logs." : undefined}
          mono
        />
        {isEdit && (
          <Select name="status" label="Status" defaultValue={vehicle?.status}>
            <option value="ACTIVE">Active</option>
            <option value="IN_SERVICE">In service</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        )}
        <Select
          name="assignedDriver"
          label="Assigned driver"
          defaultValue={vehicle?.assignedDriver?.id ?? ""}
          className="col-span-2"
        >
          <option value="">Unassigned</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="text-sm font-medium text-rose">{error}</p>}

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Save changes" : "Add vehicle"}
        </Button>
      </div>
    </form>
  );
}

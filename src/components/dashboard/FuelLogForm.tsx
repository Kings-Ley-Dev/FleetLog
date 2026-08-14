"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import { computeFuelLog } from "@/lib/calculations";
import { formatGHS } from "@/lib/utils";
import type { VehicleDTO, UserDTO, FuelLogDTO } from "@/types";

interface FuelLogFormProps {
  vehicles: VehicleDTO[];
  drivers?: UserDTO[];
  onSuccess: (log: FuelLogDTO) => void;
  onCancel: () => void;
}

export function FuelLogForm({ vehicles, drivers, onSuccess, onCancel }: FuelLogFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [currentOdometer, setCurrentOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const preview = useMemo(() => {
    if (!selectedVehicle || !currentOdometer || !liters || !cost) return null;
    try {
      return computeFuelLog({
        previousOdometer: selectedVehicle.currentOdometer,
        currentOdometer: Number(currentOdometer),
        litersPurchased: Number(liters),
        totalCostGHS: Number(cost),
      });
    } catch {
      return null;
    }
  }, [selectedVehicle, currentOdometer, liters, cost]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      vehicleId,
      currentOdometer: Number(currentOdometer),
      litersPurchased: Number(liters),
      totalCostGHS: Number(cost),
      stationName: String(form.get("stationName") || ""),
      logDate: String(form.get("logDate") || ""),
      notes: String(form.get("notes") || ""),
    };
    const driverId = form.get("driverId");
    if (driverId) payload.driverId = String(driverId);

    try {
      const res = await apiFetch<{ fuelLog: FuelLogDTO }>("/api/fuel-logs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSuccess(res.fuelLog);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <p className="text-sm text-slate">
        No active vehicles available. Ask your fleet manager to add one before logging fuel.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        name="vehicleId"
        label="Vehicle"
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        required
      >
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.licensePlate} — {v.make} {v.model}
          </option>
        ))}
      </Select>

      {selectedVehicle && (
        <p className="-mt-2 text-xs text-slate">
          Last recorded odometer:{" "}
          <span className="tabular font-medium text-ink">{selectedVehicle.currentOdometer.toLocaleString()} km</span>
        </p>
      )}

      {drivers && drivers.length > 0 && (
        <Select name="driverId" label="Driver" defaultValue="" hint="Leave blank to log this as yourself.">
          <option value="">Myself</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Current odometer (km)"
          type="number"
          step="0.1"
          value={currentOdometer}
          onChange={(e) => setCurrentOdometer(e.target.value)}
          required
          mono
        />
        <Input
          label="Date"
          name="logDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
          mono
        />
        <Input
          label="Liters purchased"
          type="number"
          step="0.01"
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
          required
          mono
        />
        <Input
          label="Total cost (GHS)"
          type="number"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
          mono
        />
      </div>

      <Input name="stationName" label="Fuel station" placeholder="Goil — Achimota" required />
      <Textarea name="notes" label="Notes (optional)" placeholder="Anything worth flagging about this fill-up" />

      {preview && (
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-emerald-soft p-3.5 text-center">
          <div>
            <p className="tabular text-lg font-semibold text-emerald-deep">{preview.distanceTraveled}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-deep/70">km driven</p>
          </div>
          <div>
            <p className="tabular text-lg font-semibold text-emerald-deep">{preview.fuelEfficiencyKmL}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-deep/70">km / litre</p>
          </div>
          <div>
            <p className="tabular text-lg font-semibold text-emerald-deep">{formatGHS(preview.costPerKmGHS)}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-deep/70">per km</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-rose">{error}</p>}

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save fuel log
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";
import type { UserDTO } from "@/types";

export function UserForm({
  fixedRole,
  onSuccess,
  onCancel,
}: {
  /** When set (Fleet Manager context), the role select is hidden and
   * every account created here is a driver. */
  fixedRole?: "DRIVER";
  onSuccess: (user: UserDTO) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      role: fixedRole ?? String(form.get("role") || "DRIVER"),
    };

    try {
      const res = await apiFetch<{ user: UserDTO }>("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input name="name" label="Full name" placeholder="Ama Boateng" required />
      <Input name="email" label="Email" type="email" placeholder="ama@fleetlog.gh" required />
      <Input
        name="password"
        label="Temporary password"
        type="password"
        minLength={8}
        hint="At least 8 characters. Share this securely."
        required
      />
      {!fixedRole && (
        <Select name="role" label="Role" defaultValue="DRIVER">
          <option value="DRIVER">Driver</option>
          <option value="MANAGER">Fleet Manager</option>
          <option value="ADMIN">System Admin</option>
        </Select>
      )}

      {error && <p className="text-sm font-medium text-rose">{error}</p>}

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/components/layout/UserContext";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { roleLabel } from "@/lib/rbac";
import { formatDate, initials } from "@/lib/utils";

export default function ProfilePage() {
  const user = useUser();
  const { push } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirmPassword") || "");

    if (newPassword !== confirm) {
      setError("New password and confirmation don't match.");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      push("Password updated.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your account details and security settings." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-soft text-lg font-bold text-emerald-deep">
              {initials(user.name)}
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">{user.name}</p>
              <p className="text-sm text-slate">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone="mint">{roleLabel(user.role)}</Badge>
                <span className="text-xs text-slate-soft">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-bold text-ink">
              <KeyRound className="size-4" /> Change password
            </h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input name="currentPassword" label="Current password" type="password" required />
              <Input name="newPassword" label="New password" type="password" minLength={8} required />
              <Input name="confirmPassword" label="Confirm new password" type="password" minLength={8} required />
              {error && <p className="text-sm font-medium text-rose">{error}</p>}
              <Button type="submit" loading={loading} className="self-start">
                Update password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

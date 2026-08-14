"use client";

import { useEffect, useState } from "react";
import { Plus, Users as UsersIcon, Ban, CheckCircle2, Clock, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { UserForm } from "@/components/dashboard/UserForm";
import { useUser } from "@/components/layout/UserContext";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { roleLabel } from "@/lib/rbac";
import { formatDate, initials } from "@/lib/utils";
import type { Role } from "@/lib/validation";
import type { UserDTO } from "@/types";

export default function UsersPage() {
  const currentUser = useUser();
  const isManager = currentUser.role === "MANAGER";
  const { push } = useToast();
  const [users, setUsers] = useState<UserDTO[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toggling, setToggling] = useState<UserDTO | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [rejecting, setRejecting] = useState<UserDTO | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await apiFetch<{ users: UserDTO[] }>("/api/users");
      setUsers(res.users);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not load users.", "error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async load(); setState happens after an await
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = (users ?? []).filter((u) => u.status === "PENDING");
  const others = (users ?? []).filter((u) => u.status !== "PENDING");

  function handleCreated(u: UserDTO) {
    setUsers((prev) => (prev ? [u, ...prev] : [u]));
    setFormOpen(false);
    push(`Account created for ${u.name}.`);
  }

  async function handleRoleChange(u: UserDTO, role: Role) {
    const prev = users;
    setUsers((cur) => cur?.map((x) => (x.id === u.id ? { ...x, role } : x)) ?? null);
    try {
      await apiFetch(`/api/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      push(`${u.name}'s role updated to ${roleLabel(role)}.`);
    } catch (err) {
      setUsers(prev ?? null);
      push(err instanceof ApiError ? err.message : "Could not update role.", "error");
    }
  }

  async function handleApprove(u: UserDTO) {
    setApprovingId(u.id);
    try {
      const res = await apiFetch<{ user: UserDTO }>(`/api/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      setUsers((prev) => prev?.map((x) => (x.id === res.user.id ? res.user : x)) ?? null);
      push(`${u.name} approved — they can now sign in.`);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not approve this account.", "error");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject() {
    if (!rejecting) return;
    setRejectLoading(true);
    try {
      await apiFetch(`/api/users/${rejecting.id}`, { method: "DELETE" });
      setUsers((prev) => prev?.filter((u) => u.id !== rejecting.id) ?? null);
      push(`${rejecting.name}'s request was declined.`);
      setRejecting(null);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not decline this request.", "error");
    } finally {
      setRejectLoading(false);
    }
  }

  async function handleToggleStatus() {
    if (!toggling) return;
    setToggleLoading(true);
    const nextStatus = toggling.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await apiFetch<{ user: UserDTO }>(`/api/users/${toggling.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setUsers((prev) => prev?.map((u) => (u.id === res.user.id ? res.user : u)) ?? null);
      push(nextStatus === "ACTIVE" ? `${toggling.name} re-enabled.` : `${toggling.name} disabled.`);
      setToggling(null);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not update account status.", "error");
    } finally {
      setToggleLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={isManager ? "Drivers" : "Users"}
        description={
          isManager
            ? "Manage driver accounts for your fleet, and approve new sign-ups."
            : "Manage accounts and roles for everyone using FleetLog."
        }
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> {isManager ? "Add driver" : "Add user"}
          </Button>
        }
      />

      {users !== null && pending.length > 0 && (
        <Card className="mb-6 border-amber/40">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <Clock className="size-4 text-amber" />
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
              Pending approval
            </h3>
            <Badge tone="amber">{pending.length}</Badge>
          </div>
          <ul className="divide-y divide-line">
            {pending.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-soft text-xs font-bold text-[#8a5a10]">
                    {initials(u.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{u.name}</p>
                    <p className="text-xs text-slate">
                      {u.email} · Requested {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setRejecting(u)}>
                    <X className="size-3.5" /> Decline
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(u)} loading={approvingId === u.id}>
                    <CheckCircle2 className="size-3.5" /> Approve
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        {users === null ? (
          <Spinner />
        ) : others.length === 0 ? (
          <EmptyState icon={UsersIcon} title={isManager ? "No drivers yet" : "No users yet"} />
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                  <th className="px-5 py-3">User</th>
                  {!isManager && <th className="px-5 py-3">Role</th>}
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {others.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-cream/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-xs font-bold text-emerald-deep">
                            {initials(u.name)}
                          </div>
                          <div>
                            <p className="font-medium text-ink">
                              {u.name} {isSelf && <span className="text-xs font-normal text-slate">(you)</span>}
                            </p>
                            <p className="text-xs text-slate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {!isManager && (
                        <td className="px-5 py-3.5">
                          {isSelf ? (
                            <Badge tone="mint">{roleLabel(u.role)}</Badge>
                          ) : (
                            <Select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                              className="!h-8 !py-1 text-xs"
                            >
                              <option value="DRIVER">Driver</option>
                              <option value="MANAGER">Fleet Manager</option>
                              <option value="ADMIN">System Admin</option>
                            </Select>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <Badge tone={statusTone(u.status)}>{u.status === "ACTIVE" ? "Active" : "Disabled"}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => setToggling(u)}
                            className="inline-flex items-center gap-1.5 rounded-lg p-2 text-slate hover:bg-cream hover:text-ink cursor-pointer"
                            aria-label={u.status === "ACTIVE" ? "Disable account" : "Enable account"}
                          >
                            {u.status === "ACTIVE" ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
                          </button>
                        )}
                      </td>
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
        title={isManager ? "Add a new driver" : "Add a new user"}
        description="They'll sign in with the temporary password you set below."
      >
        <UserForm fixedRole={isManager ? "DRIVER" : undefined} onSuccess={handleCreated} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={handleToggleStatus}
        title={toggling?.status === "ACTIVE" ? "Disable this account?" : "Re-enable this account?"}
        description={
          toggling?.status === "ACTIVE"
            ? `${toggling?.name} will no longer be able to sign in.`
            : `${toggling?.name} will regain access to FleetLog.`
        }
        confirmLabel={toggling?.status === "ACTIVE" ? "Disable" : "Enable"}
        danger={toggling?.status === "ACTIVE"}
        loading={toggleLoading}
      />

      <ConfirmDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        onConfirm={handleReject}
        title="Decline this request?"
        description={`${rejecting?.name}'s sign-up request will be permanently removed. They can sign up again later if needed.`}
        confirmLabel="Decline"
        danger
        loading={rejectLoading}
      />
    </div>
  );
}

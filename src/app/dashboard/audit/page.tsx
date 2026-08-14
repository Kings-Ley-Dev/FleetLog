"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDateTime, labelize } from "@/lib/utils";
import type { AuditLogDTO } from "@/types";

export default function AuditLogPage() {
  const { push } = useToast();
  const [entries, setEntries] = useState<AuditLogDTO[] | null>(null);

  useEffect(() => {
    apiFetch<{ items: AuditLogDTO[] }>("/api/audit")
      .then((res) => setEntries(res.items))
      .catch((err) => push(err instanceof ApiError ? err.message : "Could not load audit log.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader title="Audit Log" description="A record of key actions taken across FleetLog, most recent first." />

      <Card>
        {entries === null ? (
          <Spinner />
        ) : entries.length === 0 ? (
          <EmptyState icon={ScrollText} title="No activity recorded yet" />
        ) : (
          <ul className="divide-y divide-line">
            {entries.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-4 px-5 py-3.5 text-sm">
                <div>
                  <p className="font-medium text-ink">
                    {labelize(e.action)} <span className="font-normal text-slate">by {e.actor.name}</span>
                  </p>
                  {e.detail && <p className="mt-0.5 text-xs text-slate">{e.detail}</p>}
                </div>
                <span className="tabular whitespace-nowrap text-xs text-slate-soft">{formatDateTime(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

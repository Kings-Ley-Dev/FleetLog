import "server-only";
import AuditLog from "@/models/AuditLog";

/** Fire-and-forget audit trail write (Admin visibility, SRS §2 System Admin). */
export async function recordAudit(actorId: string, action: string, detail?: string) {
  try {
    await AuditLog.create({ actor: actorId, action, detail });
  } catch {
    // Audit logging must never break the primary request.
  }
}

import type { AuditAction, AppUser } from "@/types";
import { auditLog } from "@/lib/dummyData";

interface AuditEntry {
  user: AppUser;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityDisplay?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

/** Write an immutable audit log entry — DUMMY VERSION */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    auditLog.push({
      id: `audit-${Date.now()}`,
      user_id: entry.user.id,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      entity_display: entry.entityDisplay || "",
      old_values: entry.oldValues || null,
      new_values: entry.newValues || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // Audit failures must never crash the main operation
    console.error("[AUDIT LOG FAILURE]", err);
  }
}

/** Record an approval/rejection event — DUMMY VERSION */
export async function recordApproval(params: {
  entityType: string;
  entityId: string;
  action: "submitted" | "approved" | "rejected" | "revoked";
  user: AppUser;
  comment?: string;
}): Promise<void> {
  try {
    // Log to audit log
    await logAudit({
      user: params.user,
      action: params.action.toUpperCase() as any,
      entityType: params.entityType,
      entityId: params.entityId,
      newValues: { action: params.action, comment: params.comment },
    });
  } catch (err) {
    console.error("[APPROVAL RECORD FAILURE]", err);
  }
}

/** Generate human-readable sequence numbers */
export async function generateDocNo(prefix: string, sequenceName: string): Promise<string> {
  // Dummy implementation - generates sequential numbers
  const timestamp = Date.now();
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}${random}`;
}

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
      action_by:       params.user.id,
      action_by_name:  params.user.full_name,
      action_by_role:  params.user.role,
      comment:         params.comment ?? null,
    });
  } catch (err) {
    console.error("[APPROVAL HISTORY FAILURE]", err);
  }
}

/** Generate human-readable sequence numbers */
export async function generateDocNo(prefix: string, sequenceName: string): Promise<string> {
  const supabase = createServiceClient();
  const { data } = await supabase.rpc("nextval_seq", { seq_name: sequenceName });
  const year = new Date().getFullYear().toString().slice(-2);
  const padded = String(data ?? 1).padStart(4, "0");
  return `${prefix}-${year}${padded}`;
}

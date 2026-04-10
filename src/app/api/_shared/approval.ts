import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { logAudit, recordApproval } from "@/lib/audit";

// ═══════════════════════════════════════════════
// GENERIC APPROVAL HANDLER - reused across modules
// ═══════════════════════════════════════════════
export async function handleApproval(params: {
  table:          string;
  idCol:          string;
  id:             string;
  batchStatusCol: string;
  batchStatusVal: string;
  req:            NextRequest;
}) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;

  const { comment, action } = await (params.req.clone()).json();
  const isApprove = action !== "reject";
  const supabase = createServiceClient();

  const { data: record } = await supabase.from(params.table).select("*").eq("id", params.id).single();
  if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });
  if (record.is_locked) return NextResponse.json({ error: "Record is locked" }, { status: 409 });

  const newStatus = isApprove ? "approved" : "rejected";

  await supabase.from(params.table).update({
    status:           newStatus,
    approved_by:      isApprove ? user.id : null,
    approved_at:      isApprove ? new Date().toISOString() : null,
    approval_comment: comment || null,
    is_locked:        isApprove,
  }).eq("id", params.id);

  if (isApprove && record.batch_id) {
    await supabase.from("batches").update({ [params.batchStatusCol]: params.batchStatusVal }).eq("id", record.batch_id);
  }

  await logAudit({ user, action: isApprove ? "APPROVE" : "REJECT", entityType: params.table, entityId: params.id, oldValues: { status: record.status }, newValues: { status: newStatus } });
  await recordApproval({ entityType: params.table, entityId: params.id, action: isApprove ? "approved" : "rejected", user, comment });

  return NextResponse.json({ success: true });
}

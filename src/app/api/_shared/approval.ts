import { NextRequest, NextResponse } from "next/server";
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

  // Dummy implementation - just return success
  // In a real system, this would update the database
  const newStatus = isApprove ? "approved" : "rejected";

  await logAudit({ 
    user, 
    action: isApprove ? "APPROVE" : "REJECT", 
    entityType: params.table, 
    entityId: params.id, 
    oldValues: { status: "submitted" }, 
    newValues: { status: newStatus } 
  });
  
  await recordApproval({ 
    entityType: params.table, 
    entityId: params.id, 
    action: isApprove ? "approved" : "rejected", 
    user, 
    comment 
  });

  return NextResponse.json({ success: true, status: newStatus });
}

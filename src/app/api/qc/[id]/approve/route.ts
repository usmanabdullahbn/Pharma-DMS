import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { qcRecords, batches } from "@/lib/dummyData";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const { comment, action } = await req.json();
  const isApprove = action !== "reject";

  const rec = qcRecords.find((q) => q.id === params.id);
  if (!rec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (rec.is_locked) {
    return NextResponse.json({ error: "Locked" }, { status: 409 });
  }

  const newStatus = isApprove ? "approved" : "rejected";
  rec.status = newStatus;
  rec.approved_by = isApprove ? user.id : null;
  rec.approval_date = isApprove ? new Date().toISOString() : null;
  rec.is_locked = isApprove;

  if (isApprove && rec.batch_id) {
    const col = rec.test_type === "final_release" ? "qc_fr_status" : "qc_ip_status";
    const batch = batches.find((b) => b.id === rec.batch_id);
    if (batch) {
      Object.assign(batch, {
        [col]: rec.conclusion === "pass" ? "passed" : "failed",
      });
    }
  }

  return NextResponse.json({ success: true });
}

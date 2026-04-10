import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { grns, batches } from "@/lib/dummyData";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const { comment, action } = await req.json();

  const grn = grns.find((g) => g.id === params.id);
  if (!grn) {
    return NextResponse.json({ error: "GRN not found" }, { status: 404 });
  }

  if (grn.is_locked) {
    return NextResponse.json({ error: "Record is locked" }, { status: 409 });
  }

  grn.status = "approved";
  grn.approved_by = user.id;
  grn.approval_date = new Date().toISOString();
  grn.is_locked = true;

  // Update batch status
  const batch = batches.find((b) => b.id === grn.batch_id);
  if (batch) {
    batch.grn_status = "done";
  }

  return NextResponse.json({ success: true });
}

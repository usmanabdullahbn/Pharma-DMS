import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { dispensing, batches } from "@/lib/dummyData";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const { comment, action } = await req.json();
  const isApprove = action !== "reject";

  const rec = dispensing.find((d) => d.id === params.id);
  if (!rec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (rec.status === "locked") {
    return NextResponse.json({ error: "Record is locked" }, { status: 409 });
  }

  const newStatus = isApprove ? "approved" : "rejected";
  rec.status = newStatus;

  if (isApprove && rec.batch_id) {
    const batch = batches.find((b) => b.id === rec.batch_id);
    if (batch) {
      batch.disp_status = "done";
    }
  }

  return NextResponse.json({ success: true });
}

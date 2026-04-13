import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { Batch } from "@/types";
import { batches } from "@/lib/dummyData";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = [...batches].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["qa_regulatory", "management", "production"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;

  const body = await req.json();
  const year = new Date().getFullYear().toString().slice(-2);
  const batchNo = `BTH-${year}${String(batches.length + 1).padStart(4, "0")}`;

  const newBatch: Batch = {
    id: `batch-${Date.now()}`,
    batch_no: batchNo,
    product_name: (body.product_name || "") as string,
    batch_size: body.batch_size || 1000,
    batch_size_unit: body.batch_size_unit || "kg",
    current_stage: "grn",
    grn_status: "pending",
    disp_status: "pending",
    bmr_status: "pending",
    qc_ip_status: "pending",
    qc_fr_status: "pending",
    prod_status: "pending",
    fg_status: "pending",
    release_status: "pending",
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  batches.push(newBatch);

  return NextResponse.json({ data: newBatch }, { status: 201 });
}

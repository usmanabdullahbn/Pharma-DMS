import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
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
  const batchNo = `BTH-${year}${String((batches.length + 1).padStart(4, "0"))}`;

  const newBatch = {
    id: `batch-${Date.now()}`,
    batch_no: batchNo,
    product_name: body.product_name,
    strength: body.strength || "",
    dosage_form: body.dosage_form || "",
    pack_size: body.pack_size || "",
    manufacturing_date: body.manufacturing_date || new Date().toISOString().split("T")[0],
    expiry_date: body.expiry_date || "",
    status: "pending",
    current_stage: "grn" as const,
    grn_status: "pending" as const,
    dispensing_status: "pending" as const,
    bmr_status: "pending" as const,
    qc_ip_status: "pending" as const,
    qc_fr_status: "pending" as const,
    production_status: "pending" as const,
    fg_status: "pending" as const,
    release_status: "pending" as const,
    created_at: new Date().toISOString(),
    created_by: user.id,
  };

  batches.push(newBatch);

  return NextResponse.json({ data: newBatch }, { status: 201 });
}

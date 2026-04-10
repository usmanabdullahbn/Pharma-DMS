import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { stabilityResults } from "@/lib/dummyData";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(["qc_lab", "qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const data = {
    id: `star-${Date.now()}`,
    study_id: params.id,
    timepoint: body.timepointMonths || 0,
    result: body.result,
    status: body.verdict ?? "pass",
    created_at: new Date().toISOString(),
  };

  stabilityResults.push(data);

  return NextResponse.json({ data }, { status: 201 });
}

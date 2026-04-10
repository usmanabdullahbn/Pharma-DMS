import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { grns } from "@/lib/dummyData";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const { comment } = await req.json();

  if (!comment?.trim()) {
    return NextResponse.json(
      { error: "Rejection reason required" },
      { status: 400 }
    );
  }

  const grn = grns.find((g) => g.id === params.id);
  if (!grn) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  grn.status = "rejected";

  return NextResponse.json({ success: true });
}

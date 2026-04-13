import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";

// PDF generation stubs for demo mode - actual implementation would connect to Supabase

export async function POST_BMR_PDF(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;
  return NextResponse.json({ error: "PDF generation not available in demo mode" }, { status: 501 });
}

export async function POST_COA_PDF(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;
  return NextResponse.json({ error: "PDF generation not available in demo mode" }, { status: 501 });
}

export async function POST_RELEASE_PDF(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;
  return NextResponse.json({ error: "PDF generation not available in demo mode" }, { status: 501 });
}

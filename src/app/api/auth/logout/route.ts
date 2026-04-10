import { NextResponse } from "next/server";

export async function POST() {
  // 🔓 DUMMY MODE: Just redirect to login
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}

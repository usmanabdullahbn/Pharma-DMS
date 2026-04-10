import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 🔓 DUMMY MODE: All auth disabled for local development
  // Redirect root to dashboard
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow all routes through
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

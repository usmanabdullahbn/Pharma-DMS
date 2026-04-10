import { CAN_APPROVE, MODULE_ACCESS, type AppUser, type UserRole } from "@/types";
import { NextResponse } from "next/server";
import { dummyUser } from "@/lib/dummyData";

/** Get the currently authenticated AppUser — DUMMY VERSION (no Supabase) */
export async function getCurrentUser(): Promise<AppUser | null> {
  // Return dummy user for local development
  return dummyUser as AppUser;
}

/** API route guard — returns 401/403 response or null if OK — DUMMY VERSION */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<{ user: AppUser } | NextResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!user.is_active) {
    return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: `Access denied. Required role: ${allowedRoles.join(" or ")}` },
      { status: 403 }
    );
  }

  return { user };
}

/** Check if user can approve documents */
export function canApprove(role: UserRole): boolean {
  return CAN_APPROVE.includes(role);
}

/** Check if user has access to a module */
export function hasModuleAccess(role: UserRole, module: string): boolean {
  return MODULE_ACCESS[role]?.includes(module) ?? false;
}

/** Helper used in API routes */
export function isAuthResponse(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

import { dummyUser } from "@/lib/dummyData";
import type { AppUser } from "@/types";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Use dummy user for local development (no Supabase)
  const appUser = dummyUser as AppUser;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header user={appUser} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar user={appUser} />
        <main style={{
          flex: 1, overflow: "auto",
          padding: "28px 32px",
          background: "var(--bg)",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

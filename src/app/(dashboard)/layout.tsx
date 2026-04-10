import { dummyUser } from "@/lib/dummyData";
import type { AppUser } from "@/types";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import ProtectedDashboard from "@/components/ProtectedDashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Use dummy user for local development (no Supabase)
  const appUser = dummyUser as AppUser;

  return (
    <ProtectedDashboard>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <Header user={appUser} />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar user={appUser} />
          <main style={{
            flex: 1, 
            overflow: "auto",
            padding: "16px",
            paddingTop: "28px",
            background: "var(--bg)",
          }}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedDashboard>
  );
}

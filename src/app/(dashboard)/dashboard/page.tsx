import { dummyUser, batches } from "@/lib/dummyData";
import DashboardClient from "@/components/modules/DashboardClient";
import type { DashboardStats, Notification } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = dummyUser;

  // Fetch dashboard stats
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard`, { cache: "no-store" });
  const { data: dashData } = await res.json();

  const stats: DashboardStats = {
    total_batches: dashData.stats.totalBatches,
    released: dashData.stats.completedBatches,
    in_production: dashData.stats.productionRunning,
    awaiting_release: dashData.stats.pendingBatches,
    pending_approvals: dashData.stats.qcPending,
    open_deviations: 0,
  };

  const notifications: Notification[] = [];

  return (
    <DashboardClient
      user={user}
      batches={batches}
      stats={stats}
      notifications={notifications}
    />
  );
}

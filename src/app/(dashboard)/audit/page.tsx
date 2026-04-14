import { dummyUser } from "@/lib/dummyData";
import { AuditClient } from "@/components/modules/OtherClients";
export const dynamic = "force-dynamic";
export default async function AuditPage() {
  const user = dummyUser;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/audit`, { cache: "no-store" });
  const { data } = await res.json();
  return <AuditClient records={data ?? []} />;
}

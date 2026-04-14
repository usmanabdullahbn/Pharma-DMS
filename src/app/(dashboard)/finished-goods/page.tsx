import { dummyUser, batches } from "@/lib/dummyData";
import { FGClient } from "@/components/modules/OtherClients";
export const dynamic = "force-dynamic";
export default async function FGPage() {
  const user = dummyUser;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/finished-goods`, { cache: "no-store" });
  const { data: records } = await res.json();
  return <FGClient user={user} records={records ?? []} batches={batches ?? []} />;
}

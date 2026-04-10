import { dummyUser, batches } from "@/lib/dummyData";
import { FGClient } from "@/components/modules/OtherClients";
export const dynamic = "force-dynamic";
export default async function FGPage() {
  const user = dummyUser;
  const res = await fetch("http://localhost:3000/api/finished-goods", { cache: "no-store" });
  const { data: records } = await res.json();
  return <FGClient user={user} records={records ?? []} batches={batches ?? []} />;
}

import { dummyUser, batches } from "@/lib/dummyData";
import { ReleaseClient } from "@/components/modules/OtherClients";
export const dynamic = "force-dynamic";
export default async function ReleasePage() {
  const user = dummyUser;
  const res = await fetch("http://localhost:3000/api/release", { cache: "no-store" });
  const { data: records } = await res.json();
  return <ReleaseClient user={user} records={records ?? []} batches={batches ?? []} />;
}

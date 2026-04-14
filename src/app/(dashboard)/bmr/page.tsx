import { dummyUser, batches } from "@/lib/dummyData";
import { BMRClient } from "@/components/modules/BMRClient";
export const dynamic = "force-dynamic";
export default async function BMRPage() {
  const user = dummyUser;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bmr`, { cache: "no-store" });
  const { data: records } = await res.json();
  return <BMRClient user={user} records={records ?? []} batches={batches ?? []} />;
}

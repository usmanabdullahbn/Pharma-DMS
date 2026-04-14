// DISPENSING PAGE
import { dummyUser, batches } from "@/lib/dummyData";
import DispensingClient from "@/components/modules/DispensingClient";
export const dynamic = "force-dynamic";
export default async function DispensingPage() {
  const user = dummyUser;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dispensing`, { cache: "no-store" });
  const { data: records } = await res.json();
  return <DispensingClient user={user} records={records ?? []} batches={batches ?? []} />;
}

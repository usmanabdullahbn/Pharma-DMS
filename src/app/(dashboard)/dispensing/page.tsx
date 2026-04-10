// DISPENSING PAGE
import { dummyUser, batches } from "@/lib/dummyData";
import DispensingClient from "@/components/modules/DispensingClient";
export const dynamic = "force-dynamic";
export default async function DispensingPage() {
  const user = dummyUser;
  const res = await fetch("http://localhost:3000/api/dispensing", { cache: "no-store" });
  const { data: records } = await res.json();
  return <DispensingClient user={user} records={records ?? []} batches={batches ?? []} />;
}

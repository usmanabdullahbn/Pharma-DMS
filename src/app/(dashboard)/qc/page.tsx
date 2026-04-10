import { dummyUser, batches as dummyBatches, qcRecords } from "@/lib/dummyData";
import QCClient from "@/components/modules/QCClient";
export const dynamic = "force-dynamic";
export default async function QCPage() {
  const user = dummyUser;
  const res = await fetch("http://localhost:3000/api/qc", { cache: "no-store" });
  const { data: records } = await res.json();
  return <QCClient user={user} records={records ?? []} batches={dummyBatches ?? []} />;
}

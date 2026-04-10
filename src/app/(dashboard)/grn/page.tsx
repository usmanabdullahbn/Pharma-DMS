import { dummyUser, batches } from "@/lib/dummyData";
import GRNClient from "@/components/modules/GRNClient";

export const dynamic = "force-dynamic";

export default async function GRNPage() {
  const user = dummyUser;

  const res = await fetch("http://localhost:3000/api/grn", { cache: "no-store" });
  const { data: grns } = await res.json();

  return <GRNClient user={user} grns={grns ?? []} batches={batches ?? []} />;
}

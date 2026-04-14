import { dummyUser, batches } from "@/lib/dummyData";
import GRNClient from "@/components/modules/GRNClient";

export const dynamic = "force-dynamic";

export default async function GRNPage() {
  const user = dummyUser;

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/grn`, { cache: "no-store" });
  const { data: grns } = await res.json();

  return <GRNClient user={user} grns={grns ?? []} batches={batches ?? []} />;
}

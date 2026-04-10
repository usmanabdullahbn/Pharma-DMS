import { dummyUser, batches } from "@/lib/dummyData";
import StabilityClient from "@/components/modules/StabilityClient";
export const dynamic = "force-dynamic";
export default async function StabilityPage() {
  const user = dummyUser;
  const res = await fetch("http://localhost:3000/api/stability", { cache: "no-store" });
  const { data: studies } = await res.json();
  return <StabilityClient user={user} studies={studies ?? []} batches={batches ?? []} />;
}

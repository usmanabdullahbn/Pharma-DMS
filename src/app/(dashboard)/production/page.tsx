import { dummyUser } from "@/lib/dummyData";
export const dynamic = "force-dynamic";
export default async function ProductionPage() {
  const user = dummyUser;
  const res = await fetch("http://localhost:3000/api/production", { cache: "no-store" });
  const { data: batches } = await res.json();
  const { ProductionClient } = await import("@/components/modules/ProductionClient");
  return <ProductionClient user={user} batches={batches ?? []} />;
}

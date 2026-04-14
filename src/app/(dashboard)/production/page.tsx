import { dummyUser } from "@/lib/dummyData";
export const dynamic = "force-dynamic";
export default async function ProductionPage() {
  const user = dummyUser;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/production`, { cache: "no-store" });
  const { data: batches } = await res.json();
  const { ProductionClient } = await import("@/components/modules/ProductionClient");
  return <ProductionClient user={user} batches={batches ?? []} />;
}

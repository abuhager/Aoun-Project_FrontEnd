import HubsExplorer from "./HubsExplorer";
import { getPublicHubsServer } from "@/lib/api/publicApiServer";

export default async function HubsPage() {
  const hubs = await getPublicHubsServer().catch(() => []);
  return <HubsExplorer initialHubs={hubs} />;
}

import type { MetadataRoute } from "next";

import {
  getPublicDonationRequestsServer,
  getPublicItemsServer,
} from "@/lib/api/publicApiServer";

const siteUrl = "https://www.aoun.website";
const MAX_DYNAMIC_PAGES = 50;

export const revalidate = 300;

const staticRoutes: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/browse", changeFrequency: "daily", priority: 0.9 },
  { path: "/donation-requests", changeFrequency: "daily", priority: 0.9 },
  { path: "/hubs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/leaderboard", changeFrequency: "weekly", priority: 0.6 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
];

async function getAllPublicItems() {
  const first = await getPublicItemsServer(
    { page: 1, limit: 100 },
    { revalidate: 300 }
  );
  const totalPages = Math.min(first.pages || 1, MAX_DYNAMIC_PAGES);

  if (totalPages <= 1) return first.items;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getPublicItemsServer(
        { page: index + 2, limit: 100 },
        { revalidate: 300 }
      )
    )
  );

  return [first, ...rest].flatMap((result) => result.items);
}

async function getAllPublicDonationRequests() {
  const first = await getPublicDonationRequestsServer(
    { page: 1, limit: 100 },
    { revalidate: 300 }
  );
  const totalPages = Math.min(first.pages || 1, MAX_DYNAMIC_PAGES);

  if (totalPages <= 1) return first.requests;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getPublicDonationRequestsServer(
        { page: index + 2, limit: 100 },
        { revalidate: 300 }
      )
    )
  );

  return [first, ...rest].flatMap((result) => result.requests);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const baseEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [itemsResult, requestsResult] = await Promise.allSettled([
    getAllPublicItems(),
    getAllPublicDonationRequests(),
  ]);

  const itemEntries: MetadataRoute.Sitemap =
    itemsResult.status === "fulfilled"
      ? itemsResult.value.map((item) => ({
          url: `${siteUrl}/items/${encodeURIComponent(item._id)}`,
          lastModified: new Date(item.updatedAt || item.createdAt),
          changeFrequency: "weekly" as const,
          priority: item.status === "متاح" ? 0.8 : 0.5,
        }))
      : [];

  const requestEntries: MetadataRoute.Sitemap =
    requestsResult.status === "fulfilled"
      ? requestsResult.value
          .filter((request) => request.status === "active")
          .map((request) => ({
            url: `${siteUrl}/donation-requests/${encodeURIComponent(request._id)}`,
            lastModified: new Date(request.updatedAt || request.createdAt),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
      : [];

  return [...baseEntries, ...itemEntries, ...requestEntries];
}

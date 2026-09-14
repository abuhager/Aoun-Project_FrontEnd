import type { MetadataRoute } from "next";

const siteUrl = "https://www.aoun.website";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/browse",
    "/donation-requests",
    "/leaderboard",
    "/terms",
    "/privacy",
  ];

  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.7,
  }));
}

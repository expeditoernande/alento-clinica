import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const routes: Array<{ path: string; priority: number; freq: "weekly" | "monthly" }> = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/psicologos", priority: 0.9, freq: "weekly" },
    { path: "/quero-atender", priority: 0.6, freq: "monthly" },
    { path: "/entrar", priority: 0.4, freq: "monthly" },
    { path: "/criar-conta", priority: 0.4, freq: "monthly" },
    { path: "/privacidade", priority: 0.3, freq: "monthly" },
    { path: "/termos", priority: 0.3, freq: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.freq,
    priority: route.priority,
  }));
}

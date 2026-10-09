import type { MetadataRoute } from "next";

function baseUrl() {
  return (process.env.SITE_URL || "https://alento-clinica.vercel.app").replace(/\/$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/psicologos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/quero-atender`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/criar-conta`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/entrar`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}

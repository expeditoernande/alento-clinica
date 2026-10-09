import type { MetadataRoute } from "next";

function baseUrl() {
  return (process.env.SITE_URL || "https://alento-clinica.vercel.app").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/minha-conta", "/agendar"],
      },
    ],
    sitemap: `${baseUrl()}/sitemap.xml`,
    host: baseUrl(),
  };
}

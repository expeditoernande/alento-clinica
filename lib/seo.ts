export function siteUrl(): string {
  return (process.env.SITE_URL || "https://alento-clinica.vercel.app").replace(/\/$/, "");
}

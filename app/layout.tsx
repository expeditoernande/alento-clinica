import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { RevealRuntime } from "@/components/ui/RevealRuntime";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const description =
  "A ALENTO é uma clínica de psicologia em São Paulo: atendimento online e presencial com psicólogos de diferentes abordagens. Crie sua conta, escolha seu psicólogo e agende sozinho.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://alento-clinica.vercel.app"),
  title: {
    default: "ALENTO — clínica de psicologia",
    template: "%s — ALENTO",
  },
  description,
  keywords: [
    "clínica de psicologia",
    "psicólogo online",
    "terapia",
    "agendar consulta psicólogo",
    "saúde mental",
    "São Paulo",
    "TCC",
    "psicanálise",
  ],
  openGraph: {
    title: "ALENTO — clínica de psicologia",
    description,
    type: "website",
    locale: "pt_BR",
    siteName: "ALENTO",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALENTO — clínica de psicologia",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <RevealRuntime />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { RevealRuntime } from "@/components/ui/RevealRuntime";
import { ScrollReset } from "@/components/ui/ScrollReset";
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
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body>
        <script
          // Evita o "flash" de tema claro: aplica o tema salvo (ou a
          // preferência do sistema) antes de qualquer pintura da página.
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('alento-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();",
          }}
        />
        <RevealRuntime />
        <ScrollReset />
        {children}
      </body>
    </html>
  );
}

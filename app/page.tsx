import { PublicShell } from "@/components/site/PublicShell";
import { Hero } from "@/components/site/Hero";
import { Values } from "@/components/site/Values";
import { Approaches } from "@/components/site/Approaches";
import { Steps } from "@/components/site/Steps";
import { TeamPreview } from "@/components/site/TeamPreview";
import { Faq } from "@/components/site/Faq";
import { ContactCta } from "@/components/site/ContactCta";
import { clinic, faqs, sessionPrices } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": `${siteUrl()}/#clinica`,
      name: clinic.name,
      description:
        "Clínica de psicologia em São Paulo com atendimento online e presencial. Escolha seu psicólogo e agende sozinho.",
      url: siteUrl(),
      telephone: clinic.phone,
      email: clinic.email,
      priceRange: `R$ ${sessionPrices.min}–R$ ${sessionPrices.max}`,
      openingHours: clinic.hours,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address,
        addressLocality: clinic.city,
        addressCountry: "BR",
      },
      areaServed: clinic.city,
      sameAs: [clinic.instagram, clinic.linkedin],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function Home() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Values />
      <Steps />
      <Approaches />
      <TeamPreview />
      <Faq />
      <ContactCta />
    </PublicShell>
  );
}

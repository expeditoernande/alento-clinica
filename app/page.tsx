import { PublicShell } from "@/components/site/PublicShell";
import { Hero } from "@/components/site/Hero";
import { Values } from "@/components/site/Values";
import { Approaches } from "@/components/site/Approaches";
import { Steps } from "@/components/site/Steps";
import { TeamPreview } from "@/components/site/TeamPreview";
import { Faq } from "@/components/site/Faq";
import { ContactCta } from "@/components/site/ContactCta";

export default function Home() {
  return (
    <PublicShell>
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

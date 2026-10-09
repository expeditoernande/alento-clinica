import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta ALENTO para agendar e acompanhar suas consultas.",
};

export default async function EntrarPage() {
  const user = await currentUser();
  if (user) redirect("/minha-conta");

  return (
    <PublicShell>
      <AuthLayout>
        <Suspense fallback={null}>
          <AuthForm mode="entrar" />
        </Suspense>
      </AuthLayout>
    </PublicShell>
  );
}

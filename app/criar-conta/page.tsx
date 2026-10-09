import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta ALENTO e agende sua primeira sessão com um psicólogo.",
};

export default async function CriarContaPage() {
  const user = await currentUser();
  if (user) redirect("/minha-conta");

  return (
    <PublicShell>
      <AuthLayout>
        <Suspense fallback={null}>
          <AuthForm mode="criar" />
        </Suspense>
      </AuthLayout>
    </PublicShell>
  );
}

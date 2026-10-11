import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Redefina a senha da sua conta ALENTO.",
  robots: { index: false, follow: false },
};

export default async function EsqueciSenhaPage() {
  const user = await currentUser();
  if (user) redirect("/minha-conta");

  return (
    <PublicShell>
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </PublicShell>
  );
}

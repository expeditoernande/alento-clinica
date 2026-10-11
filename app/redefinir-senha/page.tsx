import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Definir nova senha",
  description: "Crie uma nova senha para a sua conta ALENTO.",
  robots: { index: false, follow: false },
};

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <PublicShell>
      <AuthLayout>
        <ResetPasswordForm token={token} />
      </AuthLayout>
    </PublicShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FieldErrors } from "@/lib/validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const update = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <h1 className="display text-[clamp(1.9rem,4vw,2.6rem)] text-ink">Link inválido</h1>
        <p className="lede mt-3">
          Este link de redefinição está incompleto ou expirou. Solicite um novo para continuar.
        </p>
        <div className="mt-7">
          <Link href="/esqueci-senha" className="btn btn-primary">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage("");

    if (values.password !== values.confirmPassword) {
      setErrors({ confirmPassword: "As senhas não coincidem." });
      setMessage("Confira as senhas informadas.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token, website: "" }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        errors?: FieldErrors;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Não foi possível redefinir a senha.");
        return;
      }

      router.push("/minha-conta");
      router.refresh();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="label label-sage">Nova senha</p>
      <h1 className="display mt-3 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">Crie uma nova senha</h1>
      <p className="lede mt-3">
        Escolha uma senha nova para acessar sua conta. Depois de salvar, você já entra
        automaticamente.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          onChange={() => undefined}
        />

        <div>
          <label className="label" htmlFor="password">
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="field mt-2"
            autoComplete="new-password"
            value={values.password}
            onChange={update("password")}
            aria-invalid={Boolean(errors.password)}
            placeholder="Ao menos 8 caracteres"
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="field mt-2"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
            placeholder="Repita a senha"
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        {message && <div className="notice notice-error">{message}</div>}

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-graphite">
        <Link href="/entrar" className="link-sage text-ink">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}

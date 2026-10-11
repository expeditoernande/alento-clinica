"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FieldErrors } from "@/lib/validation";

type Mode = "entrar" | "criar";

const copy: Record<Mode, { endpoint: string; cta: string; title: string; lede: string }> = {
  entrar: {
    endpoint: "/api/auth/login",
    cta: "Entrar",
    title: "Bem-vindo de volta",
    lede: "Acesse sua conta para agendar e acompanhar suas consultas.",
  },
  criar: {
    endpoint: "/api/auth/register",
    cta: "Criar conta",
    title: "Crie sua conta",
    lede: "Um minuto para começar. Você só paga pela sessão, sem mensalidade.",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/minha-conta";
  const text = copy[mode];

  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ email: string; message: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const update = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  async function resend() {
    if (!notice) return;
    setResending(true);
    setResent(false);
    try {
      await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notice.email, website: "" }),
      });
      setResent(true);
    } catch {
      setResent(false);
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage("");

    if (mode === "criar" && values.password !== values.confirmPassword) {
      setErrors({ confirmPassword: "As senhas não coincidem." });
      setMessage("Confira as senhas informadas.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch(text.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: "" }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        errors?: FieldErrors;
        message?: string;
        requiresVerification?: boolean;
        needsVerification?: boolean;
      };

      if (data.requiresVerification || data.needsVerification) {
        setNotice({
          email: values.email,
          message:
            data.message ??
            "Enviamos um link de confirmação para o seu e-mail. Confirme para ativar a conta.",
        });
        return;
      }

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Confira os campos destacados.");
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (notice) {
    return (
      <div className="w-full max-w-md">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-sage">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3.5 7.5l8.5 6 8.5-6M4.5 6h15a1 1 0 011 1v10a1 1 0 01-1 1h-15a1 1 0 01-1-1V7a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="display mt-5 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">
          Confirme seu e-mail
        </h1>
        <p className="lede mt-3">{notice.message}</p>
        <p className="mt-2 text-[13px] text-graphite">
          Enviamos para <strong className="text-ink">{notice.email}</strong>. Verifique também a
          caixa de spam.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={resend}
            disabled={resending}
          >
            {resending ? "Reenviando…" : "Reenviar e-mail"}
          </button>
          <Link href="/entrar" className="link-sage text-[13px] text-ink">
            Já confirmei, entrar
          </Link>
        </div>
        {resent && <div className="notice mt-5 !text-sage">Pronto, reenviamos o link.</div>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <p className="label label-sage">Área do cliente</p>
      <h1 className="display mt-4 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">{text.title}</h1>
      <p className="lede mt-3">{text.lede}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          onChange={() => undefined}
        />

        {mode === "criar" && (
          <div>
            <label className="label" htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              className="field mt-2"
              autoComplete="name"
              value={values.name}
              onChange={update("name")}
              aria-invalid={Boolean(errors.name)}
              placeholder="Como podemos te chamar?"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field mt-2"
            autoComplete="email"
            value={values.email}
            onChange={update("email")}
            aria-invalid={Boolean(errors.email)}
            placeholder="voce@email.com"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="field mt-2"
            autoComplete={mode === "criar" ? "new-password" : "current-password"}
            value={values.password}
            onChange={update("password")}
            aria-invalid={Boolean(errors.password)}
            placeholder={mode === "criar" ? "Ao menos 8 caracteres" : "Sua senha"}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {mode === "criar" && (
          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirmar senha
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
        )}

        {message && <div className="notice notice-error">{message}</div>}

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Enviando…" : text.cta}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-graphite">
        {mode === "criar" ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link
          href={mode === "criar" ? "/entrar" : "/criar-conta"}
          className="link-sage text-ink"
        >
          {mode === "criar" ? "Entrar" : "Criar agora"}
        </Link>
      </p>
    </div>
  );
}

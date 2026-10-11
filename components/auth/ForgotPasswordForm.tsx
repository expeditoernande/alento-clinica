"use client";

import { useState } from "react";
import Link from "next/link";
import type { FieldErrors } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    setPending(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: "" }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        errors?: FieldErrors;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Confira o e-mail informado.");
        return;
      }

      setSent(true);
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
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
        <h1 className="display mt-5 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">Verifique seu e-mail</h1>
        <p className="lede mt-3">
          Se existir uma conta com o e-mail <strong className="text-ink">{email}</strong>, enviamos
          um link para você criar uma nova senha.
        </p>
        <p className="mt-2 text-[13px] text-graphite">
          O link expira em 1 hora. Verifique também a caixa de spam.
        </p>
        <p className="mt-6 text-[13px] text-graphite">
          <Link href="/entrar" className="link-sage text-ink">
            Voltar para o login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <p className="label label-sage">Recuperar acesso</p>
      <h1 className="display mt-3 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">Esqueceu a senha?</h1>
      <p className="lede mt-3">
        Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
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
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field mt-2"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            placeholder="voce@email.com"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {message && <div className="notice notice-error">{message}</div>}

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Enviando…" : "Enviar link"}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-graphite">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="link-sage text-ink">
          Entrar
        </Link>
      </p>
    </div>
  );
}

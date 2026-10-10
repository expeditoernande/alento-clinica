"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldErrors } from "@/lib/validation";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    email: initial.email,
    phone: initial.phone,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const update =
    (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setSuccess("");
    };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage("");
    setSuccess("");

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        ok: boolean;
        errors?: FieldErrors;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Confira os campos destacados.");
        return;
      }

      setSuccess("Dados salvos com sucesso.");
      router.refresh();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">
            Nome completo
          </label>
          <input id="name" className="field mt-2" value={initial.name} disabled />
          <p className="mt-2 text-[12px] text-stone">
            Fale com a gente se precisar alterar o nome.
          </p>
        </div>

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
          <label className="label" htmlFor="phone">
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="field mt-2"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={Boolean(errors.phone)}
            placeholder="(11) 91234-5678"
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
          <p className="mt-2 text-[12px] text-stone">Opcional. Usamos para avisos de sessão.</p>
        </div>
      </div>

      {message && <div className="notice notice-error mt-5">{message}</div>}
      {success && <div className="notice notice-success mt-5">{success}</div>}

      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

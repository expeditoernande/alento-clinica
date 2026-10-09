"use client";

import { useState } from "react";
import { approaches } from "@/lib/site";
import type { FieldErrors } from "@/lib/validation";

const initial = {
  name: "",
  email: "",
  phone: "",
  crp: "",
  approach: "",
  message: "",
  website: "",
};

export function ApplicationForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const update =
    (field: keyof typeof values) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { ok: boolean; errors?: FieldErrors; message?: string };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Confira os campos destacados.");
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
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-sage">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.2 4.2L19 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="display mt-5 text-[1.6rem] text-ink">Currículo recebido</h2>
        <p className="lede mx-auto mt-3 max-w-md">
          Obrigado pelo interesse em atender na ALENTO. Nosso time de cuidado clínico vai
          analisar seu perfil e entra em contato pelo e-mail informado.
        </p>
        <button
          type="button"
          className="btn btn-outline mt-7"
          onClick={() => {
            setValues(initial);
            setSent(false);
          }}
        >
          Enviar outro currículo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off"
        value={values.website} onChange={update("website")} aria-hidden="true" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="app-name">
            Nome completo
          </label>
          <input
            id="app-name"
            className="field mt-2"
            value={values.name}
            onChange={update("name")}
            aria-invalid={Boolean(errors.name)}
            placeholder="Seu nome"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="label" htmlFor="app-crp">
            CRP
          </label>
          <input
            id="app-crp"
            className="field mt-2"
            value={values.crp}
            onChange={update("crp")}
            aria-invalid={Boolean(errors.crp)}
            placeholder="06/123456"
          />
          {errors.crp && <p className="field-error">{errors.crp}</p>}
        </div>

        <div>
          <label className="label" htmlFor="app-email">
            E-mail
          </label>
          <input
            id="app-email"
            type="email"
            className="field mt-2"
            value={values.email}
            onChange={update("email")}
            aria-invalid={Boolean(errors.email)}
            placeholder="voce@email.com"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label className="label" htmlFor="app-phone">
            Telefone
          </label>
          <input
            id="app-phone"
            className="field mt-2"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={Boolean(errors.phone)}
            placeholder="(11) 90000-0000"
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="app-approach">
          Abordagem principal
        </label>
        <select
          id="app-approach"
          className="field mt-2"
          value={values.approach}
          onChange={update("approach")}
          aria-invalid={Boolean(errors.approach)}
        >
          <option value="">Selecione…</option>
          {approaches.map((item) => (
            <option key={item.slug} value={item.name}>
              {item.name}
            </option>
          ))}
          <option value="Outra">Outra</option>
        </select>
        {errors.approach && <p className="field-error">{errors.approach}</p>}
      </div>

      <div>
        <label className="label" htmlFor="app-message">
          Sobre você e seu trabalho
        </label>
        <textarea
          id="app-message"
          className="field mt-2"
          value={values.message}
          onChange={update("message")}
          aria-invalid={Boolean(errors.message)}
          placeholder="Formação, tempo de clínica, públicos que atende, modalidade (online/presencial) e um link para o currículo completo, se tiver."
          maxLength={2000}
        />
        {errors.message && <p className="field-error">{errors.message}</p>}
      </div>

      {message && <div className="notice notice-error">{message}</div>}

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Enviando…" : "Enviar currículo"}
      </button>
    </form>
  );
}

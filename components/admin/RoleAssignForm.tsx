"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleAssignForm({
  options,
}: {
  options: Array<{ slug: string; name: string }>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"patient" | "psychologist">("psychologist");
  const [slug, setSlug] = useState(options[0]?.slug ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, slug }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Não foi possível atualizar o acesso.");
        return;
      }
      setMessage(
        role === "psychologist"
          ? "Conta vinculada como psicólogo(a). Já pode acessar /agenda."
          : "Conta definida como paciente.",
      );
      setEmail("");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-5">
      <p className="text-[15px] font-medium text-ink">Atribuir acesso</p>
      <p className="mt-1 text-[12px] text-stone">
        Informe o e-mail de uma conta existente para conceder acesso de psicólogo(a).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="email"
          className="field"
          placeholder="e-mail da conta"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <select
          className="field"
          value={role}
          onChange={(event) => setRole(event.target.value === "psychologist" ? "psychologist" : "patient")}
        >
          <option value="psychologist">Psicólogo(a)</option>
          <option value="patient">Paciente</option>
        </select>
        {role === "psychologist" && (
          <select
            className="field sm:col-span-2"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          >
            {options.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="notice notice-error mt-4">{error}</div>}
      {message && <div className="notice mt-4 !text-sage">{message}</div>}

      <button
        type="submit"
        className="btn btn-primary mt-4 !px-5 !py-2.5 !text-[13px]"
        disabled={pending}
      >
        {pending ? "Salvando…" : "Salvar acesso"}
      </button>
    </form>
  );
}

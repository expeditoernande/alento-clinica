"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PrivacyData() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function remove() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: value.trim() }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "Não foi possível excluir a conta.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <h2 className="text-[17px] font-medium text-ink">Privacidade e dados</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-graphite">
        Você pode baixar uma cópia dos seus dados ou excluir a sua conta. A exclusão remove
        permanentemente a conta, o histórico de sessões e encerra o acesso.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a href="/api/account/export" className="btn btn-outline" download>
          Baixar meus dados
        </a>
        {!confirming && (
          <button
            type="button"
            className="btn btn-outline !border-clay !text-clay"
            onClick={() => {
              setConfirming(true);
              setMessage("");
            }}
          >
            Excluir minha conta
          </button>
        )}
      </div>

      {confirming && (
        <div className="mt-5 rounded-2xl border border-clay/50 bg-mist p-4">
          <p className="text-[13px] text-graphite">
            Esta ação é permanente. Digite <strong className="text-ink">EXCLUIR</strong> para
            confirmar.
          </p>
          <input
            className="field mt-3 max-w-xs"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="EXCLUIR"
            aria-label="Confirmação de exclusão"
          />
          {message && <div className="notice notice-error mt-4">{message}</div>}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              className="btn btn-outline !border-clay !text-clay !px-5 !py-2.5 !text-[12px]"
              onClick={remove}
              disabled={pending || value.trim() !== "EXCLUIR"}
            >
              {pending ? "Excluindo…" : "Excluir definitivamente"}
            </button>
            <button
              type="button"
              className="btn btn-outline !px-5 !py-2.5 !text-[12px]"
              onClick={() => {
                setConfirming(false);
                setValue("");
                setMessage("");
              }}
              disabled={pending}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

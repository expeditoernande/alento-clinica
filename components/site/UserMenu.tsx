"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/types";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] text-graphite transition-colors hover:bg-mist hover:text-ink";

export function UserMenu({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="menu"
        className="btn btn-primary !px-5 !py-2.5 !text-[12px]"
      >
        Olá, {firstName}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        role="menu"
        aria-label="Menu da conta"
        className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <div className="min-w-[200px] translate-y-1 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-[0_20px_45px_-24px_rgba(28,29,27,0.55)] transition-transform duration-150 group-hover:translate-y-0 group-focus-within:translate-y-0">
          <div className="px-3 py-2">
            <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
            <p className="truncate text-[11px] text-stone">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link href="/minha-conta" role="menuitem" className={itemClass}>
            Minha conta
          </Link>
          <Link href="/agendar" role="menuitem" className={itemClass}>
            Agendar consulta
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            disabled={pending}
            className={`${itemClass} disabled:opacity-60`}
          >
            {pending ? "Saindo…" : "Sair da conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

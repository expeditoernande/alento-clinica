"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { nav } from "@/lib/site";
import type { PublicUser } from "@/lib/types";

export function Nav({ user }: { user: PublicUser | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-paper/85 backdrop-blur transition-colors ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-sage text-[13px] text-graphite transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/agendar" className="btn btn-outline !px-5 !py-2.5 !text-[12px]">
                Agendar
              </Link>
              <Link
                href="/minha-conta"
                className="btn btn-primary !px-5 !py-2.5 !text-[12px]"
              >
                Olá, {user.name.split(" ")[0]}
              </Link>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn btn-outline !px-5 !py-2.5 !text-[12px]">
                Entrar
              </Link>
              <Link href="/criar-conta" className="btn btn-primary !px-5 !py-2.5 !text-[12px]">
                Criar conta
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M4 4l10 10M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 5h13M2.5 9h13M2.5 13h13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="menu-mobile"
          className="border-t border-line bg-paper transition-all duration-200 lg:hidden animate-in fade-in slide-in-from-top-1"
        >
          <div className="shell flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-xl px-3 py-3 text-[15px] text-graphite transition-colors hover:bg-mist hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2">
              {user ? (
                <>
                  <Link href="/agendar" onClick={close} className="btn btn-outline">
                    Agendar consulta
                  </Link>
                  <Link href="/minha-conta" onClick={close} className="btn btn-primary">
                    Minha conta
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/entrar" onClick={close} className="btn btn-outline">
                    Entrar
                  </Link>
                  <Link href="/criar-conta" onClick={close} className="btn btn-primary">
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

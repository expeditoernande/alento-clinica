"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "alento-theme";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", initial);
    setDark(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full border border-line"
        aria-label="Alterar tema"
        disabled
      >
        <span aria-hidden="true">☾</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-full border border-line"
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {dark ? <span aria-hidden="true">☀</span> : <span aria-hidden="true">☾</span>}
    </button>
  );
}

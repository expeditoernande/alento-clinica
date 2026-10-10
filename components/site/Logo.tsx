"use client";

import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="ALENTO — clínica de psicologia, ir para o início"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-soft text-sage transition-colors group-hover:bg-sage group-hover:text-paper">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 14.5V8M8 8c0-3 2.2-5.4 5.5-5.9C13.6 5.8 11.8 8 8 8Zm0 0C8 5 5.8 2.6 2.5 2.1 2.4 5.8 4.2 8 8 8Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="wordmark text-[15px] font-medium text-ink">Alento</span>
        <span className="mt-0.5 text-[9px] tracking-[0.2em] text-stone uppercase">
          psicologia
        </span>
      </span>
    </Link>
  );
}

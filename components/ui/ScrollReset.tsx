"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Controla a restauração de scroll do navegador.
 *
 * - Ao trocar de rota, força o topo (o `scroll-behavior: smooth` do CSS faz o
 *   Next manter a posição antiga ao navegar). Pula quando há âncora (#seção),
 *   para o salto da seção continuar funcionando.
 * - Assume o controle da restauração (`scrollRestoration = "manual"`) para o
 *   navegador não reabrir a página na posição antiga.
 * - Em um reload (F5), sobe para o topo e limpa o fragmento (#seção) da URL,
 *   para que o navegador não pule para a seção que estava aberta.
 */
export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";

    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (entry?.type !== "reload") return;

    const toTop = () => {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    toTop();
    const id = window.setTimeout(toTop, 150);
    window.addEventListener("load", toTop);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", toTop);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

/**
 * Controla a restauração de scroll do navegador.
 *
 * - Assume o controle da restauração (`scrollRestoration = "manual"`) para o
 *   navegador não reabrir a página na posição antiga.
 * - Em um reload (F5), sobe para o topo e limpa o fragmento (#seção) da URL,
 *   para que o navegador não pule para a seção que estava aberta.
 *
 * Âncoras clicadas normalmente continuam funcionando: elas não dependem da
 * restauração de scroll do histórico.
 */
export function ScrollReset() {
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

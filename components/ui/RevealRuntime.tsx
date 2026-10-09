"use client";

import { useEffect } from "react";

/**
 * Revela os blocos .reveal uma única vez para a página inteira.
 *
 * Três cuidados:
 * - `data-visible` nunca é escrito durante o render, então o HTML do servidor é
 *   idêntico ao do cliente e não há mismatch de hidratação;
 * - sem JavaScript o conteúdo continua visível, porque o CSS só esconde
 *   `.reveal` quando o <html> tem a classe `.js`, adicionada aqui;
 * - a coleta é refeita por MutationObserver. O App Router entrega a página em
 *   streaming, então este efeito pode rodar antes dos últimos blocos chegarem
 *   ao DOM; sem isso, os .reveal que aparecem depois ficariam invisíveis.
 */
export function RevealRuntime() {
  useEffect(() => {
    document.documentElement.classList.add("js");

    const pending = new Set<HTMLElement>();
    let observer: IntersectionObserver | null = null;

    const collect = () => {
      const found = document.querySelectorAll<HTMLElement>(".reveal:not([data-visible])");
      if (found.length === 0) return;
      for (const node of found) {
        if (pending.has(node)) continue;
        pending.add(node);
        observer?.observe(node);
      }
    };

    const reveal = (node: HTMLElement) => {
      if (node.dataset.visible === "true") return;
      node.dataset.visible = "true";
      observer?.unobserve(node);
      pending.delete(node);
    };

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduced && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) reveal(entry.target as HTMLElement);
          }
        },
        // Faixa generosa: em scroll rápido (wheel, PageDown, âncora) o bloco
        // pode passar direto de fora para dentro do viewport antes do callback.
        { rootMargin: "120px 0px 40% 0px", threshold: 0 },
      );
    }

    const revealAll = () => {
      for (const node of [...pending]) reveal(node);
    };

    // Rede de segurança para blocos que ficaram para trás do viewport: o
    // observer só dispara na mudança de estado, então quem já estava acima da
    // dobra quando o nó entrou no DOM nunca chega a intersectar.
    const sweep = () => {
      collect();
      if (pending.size === 0) return;
      if (reduced) return revealAll();
      const limit = window.innerHeight;
      for (const node of [...pending]) {
        if (node.getBoundingClientRect().top < limit) reveal(node);
      }
    };

    collect();
    if (reduced || !observer) revealAll();

    const mutations = new MutationObserver(sweep);
    mutations.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    window.addEventListener("load", sweep, { passive: true });

    // Fecha a janela em que o streaming pode ainda estar injetando nós.
    const timers = [
      window.setTimeout(sweep, 120),
      window.setTimeout(sweep, 600),
      window.setTimeout(sweep, 1500),
    ];

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
      window.removeEventListener("load", sweep);
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  return null;
}

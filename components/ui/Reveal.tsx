import type { ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** atraso em ms, para cascata */
  delay?: number;
  className?: string;
  /**
   * Elemento renderizado. Use `as="li"` dentro de <ol>/<ul> e `as="div"`
   * dentro de <dl>: um <div> intermediário quebraria a relação de conteúdo.
   */
  as?: ElementType;
};

/**
 * Marcador de animação. O componente é presentacional: quem observa e revela
 * é o RevealRuntime, em um único lugar. Isso evita um observer por bloco e
 * mantém o HTML do servidor igual ao do cliente (sem mismatch de hidratação).
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  return (
    <Tag
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

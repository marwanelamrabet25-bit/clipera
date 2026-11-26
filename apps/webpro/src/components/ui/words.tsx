import { createElement, Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Part = string | { text: string; className?: string; /** Décor ancré sous ce groupe de mots (groupe insécable). */ decoration?: ReactNode };

type WordsProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  parts: Part[];
  className?: string;
  /** Délai de départ en ms. */
  delay?: number;
  id?: string;
  /** Animation au chargement (hero) plutôt qu'à l'entrée dans l'écran. */
  auto?: boolean;
};

/**
 * Titre révélé mot à mot derrière un masque.
 * Le texte reste un texte normal pour les lecteurs d'écran et les moteurs de recherche.
 */
export function Words({ as = "h2", parts, className, delay = 0, id, auto }: WordsProps) {
  let i = 0;
  const children = parts.map((part, pi) => {
    const text = typeof part === "string" ? part : part.text;
    const cls = typeof part === "string" ? undefined : part.className;
    const decoration = typeof part === "string" ? null : part.decoration;
    const words = text.split(/[ \t\n]+/).filter(Boolean);
    const lastPart = pi === parts.length - 1;
    const spans = words.map((w, wi) => {
      const idx = i++;
      const isLast = wi === words.length - 1;
      return (
        <Fragment key={wi}>
          <span className={cn("rw", cls)}>
            <span style={{ "--i": idx } as CSSProperties}>{w}</span>
          </span>
          {isLast && (lastPart || decoration) ? null : " "}
        </Fragment>
      );
    });
    if (decoration) {
      return (
        <Fragment key={pi}>
          <span className="relative inline-block whitespace-nowrap">
            {spans}
            {decoration}
          </span>
          {lastPart ? null : " "}
        </Fragment>
      );
    }
    return <Fragment key={pi}>{spans}</Fragment>;
  });
  const flag = auto ? { "data-words-auto": "" } : { "data-words": "" };
  return createElement(as, { className, id, ...flag, style: { "--base": `${delay}ms` } as CSSProperties }, children);
}

import { ViewTransition } from "react";

/**
 * Transition de page native (View Transitions API, sans bibliothèque) :
 * le contenu sortant s'efface, le nouveau monte légèrement. L'en-tête et le pied de page restent fixes.
 * Sans prise en charge du navigateur ou avec « réduire les animations », la navigation reste instantanée.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}

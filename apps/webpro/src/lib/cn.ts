/** Concatène des classes conditionnelles (remplace clsx, sans dépendance). */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

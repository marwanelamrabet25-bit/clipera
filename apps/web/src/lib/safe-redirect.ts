/**
 * N'autorise que les redirections internes vers l'application (évite les redirections ouvertes
 * du type ?suite=https://site-malveillant.com ou //site-malveillant.com).
 */
export function safeNext(raw: string | null | undefined, fallback = "/app"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (!(raw === "/app" || raw.startsWith("/app/") || raw.startsWith("/app?"))) return fallback;
  return raw;
}

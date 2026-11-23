// Chargeur pour les tests unitaires : résout les imports TypeScript sans extension (« ./youtube-url » → .ts).
import { register } from "node:module";
register("data:text/javascript," + encodeURIComponent(`
export async function resolve(s, c, next) {
  try { return await next(s, c); } catch (e) {
    if ((s.startsWith(".") || s.startsWith("/")) && !/\\.[a-z]+$/.test(s)) return next(s + ".ts", c);
    throw e;
  }
}`));

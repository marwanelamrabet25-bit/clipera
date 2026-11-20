import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const PROTECTED_PREFIX = "/app";
const AUTH_PAGES = ["/connexion", "/inscription"];

/** Rafraîchit la session à chaque requête et protège l'espace /app. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    },
  );

  // Ne rien insérer entre createServerClient et getClaims (recommandation Supabase).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  if (!signedIn && (pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?suite=${encodeURIComponent(pathname + search)}`;
    return redirectWithCookies(url, response);
  }
  if (signedIn && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = PROTECTED_PREFIX;
    url.search = "";
    return redirectWithCookies(url, response);
  }
  return response;
}

function redirectWithCookies(url: URL, from: NextResponse) {
  const r = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => r.cookies.set(c));
  return r;
}

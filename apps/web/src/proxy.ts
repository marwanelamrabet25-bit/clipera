import { type NextRequest, NextResponse } from "next/server";
import { POSTS } from "@/content/blog";
import { REFERRAL_CODE_RE, REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS } from "@/lib/referral-shared";
import { updateSession } from "@/lib/supabase/proxy";

const SLUGS = new Set(POSTS.map((p) => p.slug));

export async function proxy(request: NextRequest) {
  // Article de blog inexistant : vraie erreur 404 (et non une page vide renvoyée avec le code 200).
  const m = request.nextUrl.pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (m && !SLUGS.has(decodeURIComponent(m[1]))) {
    return NextResponse.rewrite(new URL("/page-introuvable", request.url));
  }
  const response = await updateSession(request);
  // Lien de parrainage (?parrain=CODE) : mémorisé 30 jours, rattaché au compte à la première visite connectée.
  const code = request.nextUrl.searchParams.get("parrain")?.toUpperCase();
  if (code && REFERRAL_CODE_RE.test(code)) {
    response.cookies.set(REFERRAL_COOKIE, code, {
      maxAge: REFERRAL_COOKIE_DAYS * 24 * 3600,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: [
    // Tout sauf les fichiers statiques et les images.
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};

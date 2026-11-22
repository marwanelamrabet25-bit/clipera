import { type NextRequest, NextResponse } from "next/server";
import { POSTS } from "@/content/blog";
import { updateSession } from "@/lib/supabase/proxy";

const SLUGS = new Set(POSTS.map((p) => p.slug));

export async function proxy(request: NextRequest) {
  // Article de blog inexistant : vraie erreur 404 (et non une page vide renvoyée avec le code 200).
  const m = request.nextUrl.pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (m && !SLUGS.has(decodeURIComponent(m[1]))) {
    return NextResponse.rewrite(new URL("/page-introuvable", request.url));
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Tout sauf les fichiers statiques et les images.
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};

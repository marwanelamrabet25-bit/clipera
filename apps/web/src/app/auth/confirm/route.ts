import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["email", "magiclink", "signup", "invite", "recovery", "email_change"];

/**
 * Point d'arrivée du lien reçu par e-mail. Deux formats acceptés :
 *  - token_hash + type : fonctionne même si le lien est ouvert sur un autre appareil (recommandé) ;
 *  - code (PKCE) : format par défaut de Supabase, même navigateur uniquement.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("suite"));
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const supabase = await createClient();

  let ok = false;
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  const target = url.clone();
  target.search = "";
  if (ok) {
    target.pathname = next.split("?")[0];
    const query = next.includes("?") ? next.slice(next.indexOf("?")) : "";
    target.search = query;
  } else {
    target.pathname = "/connexion";
    target.search = "?erreur=lien";
  }
  return NextResponse.redirect(target);
}

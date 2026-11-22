import type { Metadata } from "next";
import { Suspense } from "react";
import { Sidebar, SidebarSkeleton } from "@/components/app/sidebar";
import { getAccount } from "@/lib/account";
import { claimReferralFromCookie } from "@/lib/referral";
import { signOut } from "../connexion/actions";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Clipera" }, robots: { index: false } };

// La structure s'affiche immédiatement ; les infos du compte arrivent dès que la session est vérifiée.
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="lg:flex">
      <Suspense fallback={<SidebarSkeleton />}>
        <AccountSidebar />
      </Suspense>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

async function AccountSidebar() {
  // Venu par un lien de parrainage : rattachement au parrain (une seule fois, règles vérifiées par la base).
  await claimReferralFromCookie();
  const account = await getAccount();
  return (
    <Sidebar
      displayName={account.displayName}
      email={account.user.email}
      planName={account.plan?.name ?? "Free"}
      signOut={signOut}
    />
  );
}

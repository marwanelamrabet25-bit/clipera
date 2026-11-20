import type { Metadata } from "next";
import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mes projets" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Mes projets"
        description="Chaque projet correspond à une vidéo importée."
        action={
          <Link href="/app/nouveau" className={buttonStyles()}>
            <Plus /> Nouveau projet
          </Link>
        }
      />
      {error ? (
        <p className="text-danger">Impossible de charger tes projets. Recharge la page.</p>
      ) : projects && projects.length > 0 ? (
        <Card>
          <ul className="divide-y divide-line">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-4 text-small">
                <span className="truncate font-medium">{p.title}</span>
                <span className="text-subtle">{formatDate(p.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState
          icon={<FolderOpen />}
          title="Aucun projet pour l'instant"
          description="Importe ta première vidéo longue pour créer ton premier projet."
          action={
            <Link href="/app/nouveau" className={buttonStyles()}>
              <Plus /> Nouveau projet
            </Link>
          }
        />
      )}
    </>
  );
}

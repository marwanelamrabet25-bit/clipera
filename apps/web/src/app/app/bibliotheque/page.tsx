import type { Metadata } from "next";
import { Film } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Bibliothèque" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: clips, error } = await supabase
    .from("clips")
    .select("id, title, start_seconds, end_seconds, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader title="Bibliothèque" description="Tous tes clips, prêts à prévisualiser et télécharger." />
      {error ? (
        <p className="text-danger">Impossible de charger tes clips. Recharge la page.</p>
      ) : clips && clips.length > 0 ? (
        <Card>
          <ul className="divide-y divide-line">
            {clips.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-4 text-small">
                <span className="truncate font-medium">{c.title ?? "Clip sans titre"}</span>
                <span className="text-subtle tabular-nums">
                  {Math.round(c.end_seconds - c.start_seconds)} s · {formatDate(c.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState
          icon={<Film />}
          title="Ta bibliothèque est vide"
          description="Les clips générés à partir de tes vidéos apparaîtront ici."
        />
      )}
    </>
  );
}

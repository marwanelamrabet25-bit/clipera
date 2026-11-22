"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Lien à copier (avec repli : sélection du texte si le presse-papiers est refusé) et partage natif sur mobile. */
export function CopyLink({ url, shareText }: { url: string; shareText: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(() => typeof navigator !== "undefined" && "share" in navigator);
  return (
    <div className="flex flex-col gap-3">
      <input
        id="referral-link"
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="h-11 w-full min-w-0 rounded-md border border-line-strong bg-surface px-3 font-mono text-small"
        aria-label="Ton lien de parrainage"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              (document.getElementById("referral-link") as HTMLInputElement | null)?.select();
            }
          }}
        >
          {copied ? <Check /> : <Copy />} {copied ? "Lien copié" : "Copier le lien"}
        </Button>
        {canShare && (
          <Button
            variant="secondary"
            onClick={() => navigator.share({ title: "Clipera", text: shareText, url }).catch(() => {})}
          >
            <Share2 /> Partager
          </Button>
        )}
      </div>
    </div>
  );
}

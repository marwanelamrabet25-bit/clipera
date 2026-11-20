"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/field";

export function EditingOptionsDemo() {
  const [o, setO] = useState({ captions: true, music: false, zooms: false, reframe: true, silences: true });
  const set = (k: keyof typeof o) => (v: boolean) => setO((p) => ({ ...p, [k]: v }));
  return (
    <div className="flex flex-col gap-5">
      <Switch label="Sous-titres" description="Synchronisés au mot près" checked={o.captions} onCheckedChange={set("captions")} />
      <Switch label="Recadrage intelligent" description="Suit le visage qui parle" checked={o.reframe} onCheckedChange={set("reframe")} />
      <Switch label="Suppression des silences" description="Retire les blancs trop longs" checked={o.silences} onCheckedChange={set("silences")} />
      <Switch label="Zooms" description="Légers, sur les moments forts" checked={o.zooms} onCheckedChange={set("zooms")} />
      <Switch label="Musique" description="Bientôt disponible" checked={o.music} onCheckedChange={set("music")} disabled />
    </div>
  );
}

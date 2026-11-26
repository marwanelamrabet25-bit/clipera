import type { Metadata } from "next";
import { Formats } from "@/components/demos/formats";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Formats verticaux (démonstration)" };

/** Planche interne : formats verticaux des projets de démonstration (source des visuels « contenus »). */
export default function FormatsPage() {
  return <Formats />;
}

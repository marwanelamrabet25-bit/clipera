import type { Metadata } from "next";
import { Formats } from "@/components/demos/formats";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Formats verticaux (exemples fictifs)" };

/** Planche interne : formats verticaux d’exemple (source des visuels vidéo de la page réseaux sociaux). */
export default function FormatsPage() {
  return <Formats />;
}

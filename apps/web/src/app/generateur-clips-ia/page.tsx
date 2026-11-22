import { ContentPage } from "@/components/marketing/content-page";
import { SOLUTIONS } from "@/content/solutions";
import { pageMetadata } from "@/lib/seo";

const page = SOLUTIONS["/generateur-clips-ia"];
export const metadata = pageMetadata(page);

export default function Page() {
  return <ContentPage page={page} />;
}

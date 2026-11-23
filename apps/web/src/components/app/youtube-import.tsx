"use client";

import { ArrowRight, Check, ExternalLink, RotateCcw, Sparkles, UserRound, Users } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { LinkImport } from "@/components/app/link-import";
import { Uploader } from "@/components/app/uploader";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { parseYouTubeUrl, studioUrl, YOUTUBE_LINK_ERRORS } from "@/lib/youtube-url";

type Video = { id: string; title: string; channel: string | null; thumbnail: string; isShort: boolean };
type State =
  | { name: "idle" }
  | { name: "checking" }
  | { name: "found"; video: Video }
  | { name: "private"; id: string }
  | { name: "error"; message: string; retry: boolean };

/**
 * Import depuis YouTube.
 * 1. Le lien est reconnu et la vidéo identifiée (titre, chaîne, miniature : informations publiques officielles).
 * 2. Le fichier est récupéré par une voie autorisée : YouTube interdit aux services tiers de télécharger les vidéos
 *    à la place de l'utilisateur. Le propriétaire récupère son fichier original dans YouTube Studio (1 clic), sinon le
 *    créateur fournit un lien Google Drive / Dropbox.
 * 3. Le moteur de clips existant prend le relais (même parcours qu'un fichier importé).
 */
export function YouTubeImport({ maxBytes, planName, maxMinutes }: { maxBytes: number; planName: string; maxMinutes: number }) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ name: "idle" });
  const [owner, setOwner] = useState<"me" | "other" | null>(null);
  const reqRef = useRef(0);

  const link = parseYouTubeUrl(url);
  const inputError = url && !link.ok && link.reason !== "empty" ? YOUTUBE_LINK_ERRORS[link.reason] : undefined;

  async function lookup(e?: FormEvent) {
    e?.preventDefault();
    if (!link.ok) {
      setState({ name: "error", message: YOUTUBE_LINK_ERRORS[link.ok ? "invalid" : link.reason], retry: false });
      return;
    }
    const req = ++reqRef.current;
    setState({ name: "checking" });
    setOwner(null);
    try {
      const res = await fetch("/api/youtube/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      if (req !== reqRef.current) return;
      if (res.ok && data.video) return setState({ name: "found", video: data.video });
      const code: string | undefined = data?.error?.code;
      if (code === "video_private") return setState({ name: "private", id: link.id });
      setState({
        name: "error",
        message: data?.error?.message ?? "Impossible de vérifier ce lien. Réessaie.",
        retry: res.status >= 500 || res.status === 401,
      });
    } catch {
      if (req !== reqRef.current) return;
      setState({ name: "error", message: "Connexion interrompue : impossible de joindre Clipera. Vérifie ta connexion et réessaie.", retry: true });
    }
  }

  function reset() {
    reqRef.current++;
    setUrl("");
    setOwner(null);
    setState({ name: "idle" });
  }

  const videoId = state.name === "found" ? state.video.id : state.name === "private" ? state.id : null;
  const step = videoId ? (owner ? 2 : 1) : 0;

  return (
    <div className="flex flex-col gap-6" data-testid="youtube-import">
      <div>
        <h2 className="text-h3 font-semibold">Transforme une vidéo YouTube en clips</h2>
        <p className="mt-1 text-small text-muted">Colle le lien de ta vidéo et laisse CLIPERA faire le travail.</p>
      </div>

      {!videoId && (
        <form onSubmit={lookup} className="flex flex-col gap-3" noValidate>
          <label htmlFor="youtube-url" className="sr-only">
            Lien de la vidéo YouTube
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="youtube-url"
              name="url"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://www.youtube.com/watch?v=…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (state.name === "error") setState({ name: "idle" });
              }}
              aria-invalid={inputError ? true : undefined}
              aria-describedby={inputError ? "youtube-url-error" : undefined}
              className={cn(
                "h-12 min-w-0 flex-1 rounded-md border bg-canvas px-4 text-body text-fg placeholder:text-subtle",
                "transition-colors focus:border-primary-soft focus:outline-none focus:ring-2 focus:ring-primary/30",
                inputError ? "border-danger/60" : "border-line-strong",
              )}
            />
            <Button size="lg" type="submit" loading={state.name === "checking"} disabled={!link.ok}>
              <Sparkles /> Générer mes clips
            </Button>
          </div>
          {inputError ? (
            <p id="youtube-url-error" className="text-caption text-danger">
              {inputError}
            </p>
          ) : (
            <p className="text-caption text-subtle">
              Vidéos, Shorts et directs terminés · {maxMinutes} min maximum avec ton offre.
            </p>
          )}
        </form>
      )}

      {state.name === "checking" && (
        <div className="flex items-center gap-4 rounded-lg border border-line bg-canvas p-4" aria-live="polite">
          <div className="aspect-video w-32 shrink-0 animate-pulse rounded-md bg-overlay" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-overlay" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-overlay" />
            <p className="text-caption text-subtle">Recherche de la vidéo sur YouTube…</p>
          </div>
        </div>
      )}

      {state.name === "error" && (
        <Alert tone="danger" title="Lien non utilisable">
          <p>{state.message}</p>
          {state.retry && (
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => lookup()}>
              <RotateCcw /> Réessayer
            </Button>
          )}
        </Alert>
      )}

      {videoId && (
        <>
          <Progress step={step} />

          {state.name === "found" ? (
            <div className="flex flex-col gap-4 rounded-lg border border-primary-line bg-primary-wash/30 p-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniature publique servie par YouTube */}
              <img
                src={state.video.thumbnail}
                alt=""
                className="aspect-video w-full rounded-md border border-line object-cover sm:w-44"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-caption font-medium text-primary-soft">
                  <Check className="size-3.5" aria-hidden /> Vidéo reconnue{state.video.isShort ? " · Short" : ""}
                </p>
                <p className="mt-1 line-clamp-2 text-body font-semibold" data-testid="youtube-title">
                  {state.video.title}
                </p>
                {state.video.channel && <p className="mt-0.5 truncate text-small text-muted">{state.video.channel}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="self-start">
                Changer de vidéo
              </Button>
            </div>
          ) : (
            <Alert tone="warning" title="Vidéo privée ou non intégrable">
              <p>
                YouTube ne nous donne pas ses informations. Si c&apos;est ta vidéo, tu peux quand même la récupérer depuis
                YouTube Studio ci-dessous.
              </p>
              <Button size="sm" variant="secondary" className="mt-3" onClick={reset}>
                Changer de vidéo
              </Button>
            </Alert>
          )}

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-small font-semibold">Qui a publié cette vidéo ?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Choice
                active={owner === "me"}
                onClick={() => setOwner("me")}
                icon={<UserRound />}
                title="Moi, c'est ma chaîne"
                text="Récupère le fichier original en 1 clic depuis YouTube Studio."
              />
              <Choice
                active={owner === "other"}
                onClick={() => setOwner("other")}
                icon={<Users />}
                title="Un autre créateur"
                text="Campagne de clipping, client… Il te faut son fichier ou son lien Drive."
              />
            </div>
          </fieldset>

          {owner === "me" && (
            <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface/40 p-4 sm:p-5" data-testid="youtube-owner">
              <ol className="flex flex-col gap-3 text-small text-muted">
                <li className="flex gap-3">
                  <Num n={1} />
                  <span>
                    Ouvre ta vidéo dans YouTube Studio (sur ordinateur).
                    <a
                      href={studioUrl(videoId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex w-fit items-center gap-2 rounded-md border border-line-strong bg-elevated px-3 py-2 font-medium text-fg hover:border-primary-line"
                    >
                      Ouvrir dans YouTube Studio <ExternalLink className="size-4" aria-hidden />
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Num n={2} />
                  <span>
                    En haut à droite, clique sur <strong className="text-fg">⋮</strong> puis{" "}
                    <strong className="text-fg">Télécharger</strong>. Le fichier MP4 arrive dans tes téléchargements.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Num n={3} />
                  <span>Dépose ce fichier ci-dessous : Clipera s&apos;occupe du reste.</span>
                </li>
              </ol>
              <Uploader
                maxBytes={maxBytes}
                planName={planName}
                titleHint={state.name === "found" ? state.video.title : undefined}
                submitLabel="Envoyer et créer mes clips"
              />
              <p className="text-caption text-subtle">
                Le téléchargement n&apos;existe pas dans l&apos;application mobile YouTube Studio. Sur téléphone, fais-le
                depuis un ordinateur, ou ajoute la vidéo à Google Drive et choisis « Un autre créateur » pour coller le
                lien.
              </p>
            </div>
          )}

          {owner === "other" && (
            <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface/40 p-4 sm:p-5" data-testid="youtube-other">
              <p className="text-small text-muted">
                Demande au créateur le fichier original ou un lien Google Drive / Dropbox de cette vidéo : c&apos;est
                aussi la meilleure qualité possible. Colle ensuite le lien ici.
              </p>
              <LinkImport maxMinutes={maxMinutes} />
            </div>
          )}

          <details className="group text-caption text-subtle">
            <summary className="cursor-pointer list-none hover:text-muted">Pourquoi cette étape ? →</summary>
            <p className="mt-2 max-w-prose">
              Les règles de YouTube interdisent aux services comme Clipera de télécharger les vidéos à ta place. Plutôt
              qu&apos;une astuce qui casse sans prévenir ou met ta chaîne en risque, Clipera utilise uniquement des
              moyens autorisés : ton fichier original depuis YouTube Studio, ou le lien fourni par le créateur.
            </p>
          </details>
        </>
      )}
    </div>
  );
}

const STEPS = ["Lien reconnu", "Récupération de la vidéo", "Génération des clips"];

function Progress({ step }: { step: number }) {
  return (
    <div aria-label="Étapes de l'import YouTube">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-overlay"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={step}
        aria-valuetext={STEPS[Math.max(step - 1, 0)]}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <ol className="mt-2 grid grid-cols-3 gap-2 text-caption">
        {STEPS.map((s, i) => (
          <li key={s} className={cn(i < step ? "text-primary-soft" : i === step ? "text-fg" : "text-subtle")}>
            {i < step && <Check className="mr-1 inline size-3" aria-hidden />}
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Choice(props: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-left transition-colors [&_svg]:size-5",
        props.active ? "border-primary bg-primary-wash/50" : "border-line-strong hover:border-primary-line",
      )}
    >
      <span className={cn("mt-0.5 shrink-0", props.active ? "text-primary-soft" : "text-subtle")}>{props.icon}</span>
      <span>
        <span className="block text-small font-semibold">{props.title}</span>
        <span className="mt-0.5 block text-caption text-muted">{props.text}</span>
      </span>
      {props.active && <ArrowRight className="ml-auto shrink-0 self-center text-primary-soft" aria-hidden />}
    </button>
  );
}

function Num({ n }: { n: number }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-primary-line text-caption font-semibold text-primary-soft">
      {n}
    </span>
  );
}

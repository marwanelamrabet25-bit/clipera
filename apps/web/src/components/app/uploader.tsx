"use client";

import { FileVideo, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";

const ACCEPTED = [".mp4", ".mov", ".m4v", ".mkv", ".webm"];
const CONCURRENCY = 4;
const MAX_RETRIES = 4;

type Phase =
  | { name: "idle" }
  | { name: "uploading"; sent: number; total: number; startedAt: number; at: number }
  | { name: "finishing" }
  | { name: "error"; message: string };

const fr = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function formatBytes(n: number) {
  if (n >= 1024 ** 3) return `${fr.format(n / 1024 ** 3)} Go`;
  return `${Math.max(1, Math.round(n / 1024 ** 2))} Mo`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  if (seconds < 60) return `${Math.ceil(seconds)} s`;
  return `${Math.ceil(seconds / 60)} min`;
}

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Erreur inattendue. Réessaie.");
  return data as T;
}

/** Envoie un morceau avec progression ; renvoie l'ETag (nécessaire pour assembler le fichier). */
function putPart(url: string, blob: Blob, onProgress: (loaded: number) => void, signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader("ETag");
      if (xhr.status >= 200 && xhr.status < 300 && etag) resolve(etag);
      else reject(new Error(xhr.status ? `HTTP ${xhr.status}${etag ? "" : " (ETag manquant)"}` : "réseau"));
    };
    xhr.onerror = () => reject(new Error("réseau"));
    xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));
    signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}

/** Nom envoyé au serveur : le titre du projet en est tiré (ex. titre de la vidéo YouTube d'origine). */
function uploadName(file: File, titleHint?: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const title = titleHint?.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  return title ? `${title}.${ext}` : file.name;
}

export function Uploader({
  maxBytes,
  planName,
  titleHint,
  submitLabel = "Importer la vidéo",
}: {
  maxBytes: number;
  planName: string;
  titleHint?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [rights, setRights] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const uploadRef = useRef<{ id: string; uploadId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = phase.name === "uploading" || phase.name === "finishing";

  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const pick = useCallback(
    (f: File | undefined) => {
      if (!f) return;
      const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
      if (!ACCEPTED.includes(ext)) {
        setFile(null);
        setPhase({ name: "error", message: "Format non pris en charge. Utilise MP4, MOV, M4V, MKV ou WEBM." });
        return;
      }
      if (f.size > maxBytes) {
        setFile(null);
        setPhase({ name: "error", message: `Fichier trop volumineux : ${formatBytes(maxBytes)} maximum avec l'offre ${planName}.` });
        return;
      }
      setFile(f);
      setPhase({ name: "idle" });
    },
    [maxBytes, planName],
  );

  async function start() {
    if (!file || !rights) return;
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;
    const startedAt = Date.now();
    setPhase({ name: "uploading", sent: 0, total: file.size, startedAt, at: startedAt });
    try {
      const init = await postJson<{ sourceVideoId: string; projectId: string; uploadId: string; partSize: number; partCount: number }>(
        "/api/uploads",
        { filename: uploadName(file, titleHint), size: file.size, rightsConfirmed: true },
        // Volontairement non interruptible : le serveur crée le projet. Si l'utilisateur annule pendant cette
        // requête, on attend la réponse pour pouvoir annuler proprement (sinon le projet resterait orphelin).
      );
      uploadRef.current = { id: init.sourceVideoId, uploadId: init.uploadId };
      if (signal.aborted) throw new DOMException("aborted", "AbortError");

      const loaded = new Map<number, number>();
      const report = () => {
        let sent = 0;
        loaded.forEach((v) => (sent += v));
        const at = Date.now();
        setPhase((p) => (p.name === "uploading" ? { ...p, sent, at } : p));
      };
      const etags = new Map<number, string>();
      const queue = Array.from({ length: init.partCount }, (_, i) => i + 1);
      const urls = new Map<number, string>();

      async function urlFor(n: number) {
        if (!urls.has(n)) {
          const batch = queue.filter((m) => m >= n && !urls.has(m)).slice(0, 20);
          const res = await postJson<{ urls: Record<string, string> }>(
            `/api/uploads/${init.sourceVideoId}/parts`,
            { uploadId: init.uploadId, partNumbers: batch.length ? batch : [n] },
            signal,
          );
          Object.entries(res.urls).forEach(([k, v]) => urls.set(Number(k), v));
        }
        return urls.get(n)!;
      }

      async function sendPart(n: number) {
        const blob = file!.slice((n - 1) * init.partSize, Math.min(n * init.partSize, file!.size));
        for (let attempt = 0; ; attempt++) {
          try {
            const etag = await putPart(await urlFor(n), blob, (l) => ((loaded.set(n, l), report())), signal);
            loaded.set(n, blob.size);
            report();
            etags.set(n, etag);
            return;
          } catch (e) {
            if (signal.aborted) throw e;
            loaded.set(n, 0);
            if (attempt >= MAX_RETRIES) throw new Error("Connexion instable : l'envoi a échoué malgré plusieurs essais.");
            urls.delete(n);
            await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
          }
        }
      }

      let next = 0;
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
          while (next < queue.length) await sendPart(queue[next++]);
        }),
      );

      setPhase({ name: "finishing" });
      const done = await postJson<{ projectId: string }>(
        `/api/uploads/${init.sourceVideoId}/complete`,
        { uploadId: init.uploadId, parts: [...etags].map(([partNumber, etag]) => ({ partNumber, etag })) },
        signal,
      );
      uploadRef.current = null;
      router.push(`/app/projets/${done.projectId}`);
    } catch (e) {
      const cancelled = signal.aborted;
      if (uploadRef.current) {
        const { id, uploadId } = uploadRef.current;
        uploadRef.current = null;
        postJson(`/api/uploads/${id}/abort`, { uploadId }).catch(() => {});
      }
      setPhase(
        cancelled
          ? { name: "idle" }
          : { name: "error", message: e instanceof Error ? e.message : "Erreur inattendue. Réessaie." },
      );
    }
  }

  const pct = phase.name === "uploading" && phase.total ? Math.floor((phase.sent / phase.total) * 100) : 0;
  const elapsed = phase.name === "uploading" ? (phase.at - phase.startedAt) / 1000 : 0;
  const speed = phase.name === "uploading" && elapsed > 1 ? phase.sent / elapsed : 0;
  const remaining = phase.name === "uploading" && speed > 0 ? (phase.total - phase.sent) / speed : NaN;

  return (
    <div className="flex flex-col gap-5">
      {phase.name === "error" && (
        <Alert tone="danger" title="L'envoi n'a pas abouti">
          {phase.message}
        </Alert>
      )}

      {!busy && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Choisir une vidéo à importer"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => (e.preventDefault(), setDragging(true))}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors",
            dragging ? "border-primary-soft bg-primary-wash" : "border-line-strong hover:border-primary-line",
          )}
        >
          <div className="mb-4 grid size-12 place-items-center rounded-md border border-primary-line bg-primary-wash text-primary-soft">
            {file ? <FileVideo className="size-5" aria-hidden /> : <Upload className="size-5" aria-hidden />}
          </div>
          {file ? (
            <>
              <p className="max-w-full truncate text-h3 font-semibold">{file.name}</p>
              <p className="mt-1 text-small text-muted">{formatBytes(file.size)} · cliquer pour changer</p>
            </>
          ) : (
            <>
              <p className="text-h3 font-semibold">Glisse ta vidéo ici</p>
              <p className="mt-1 text-small text-muted">
                ou clique pour choisir un fichier · MP4, MOV, M4V, MKV, WEBM · {formatBytes(maxBytes)} max
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={["video/mp4", "video/quicktime", ...ACCEPTED].join(",")}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => pick(e.target.files?.[0])}
            data-testid="file-input"
          />
        </div>
      )}

      {phase.name === "uploading" || phase.name === "finishing" ? (
        <div className="rounded-lg border border-line bg-canvas p-5" aria-live="polite">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <p className="truncate text-small font-medium">{file?.name}</p>
            <p className="shrink-0 text-small text-muted tabular-nums">
              {phase.name === "finishing" ? "Finalisation…" : `${pct} %`}
            </p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-overlay"
            role="progressbar"
            aria-label="Progression de l'envoi"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={phase.name === "finishing" ? 100 : pct}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${phase.name === "finishing" ? 100 : pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-caption text-subtle tabular-nums">
            <span>
              {phase.name === "uploading"
                ? `${formatBytes(phase.sent)} / ${formatBytes(phase.total)}${speed ? ` · ${formatBytes(speed)}/s` : ""}${
                    formatDuration(remaining) ? ` · encore ${formatDuration(remaining)}` : ""
                  }`
                : "Vérification du fichier reçu"}
            </span>
            {phase.name === "uploading" && (
              <Button size="sm" variant="ghost" onClick={() => abortRef.current?.abort()}>
                <X /> Annuler
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <label className="flex cursor-pointer items-start gap-3 text-small text-muted">
            <input
              type="checkbox"
              checked={rights}
              onChange={(e) => setRights(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              Je confirme détenir les droits nécessaires sur cette vidéo (j&apos;en suis l&apos;auteur ou j&apos;ai
              l&apos;autorisation de l&apos;exploiter).
            </span>
          </label>
          <div>
            <Button size="lg" onClick={start} disabled={!file || !rights}>
              <Upload /> {submitLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

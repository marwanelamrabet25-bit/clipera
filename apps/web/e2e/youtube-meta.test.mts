// Infos publiques (oEmbed) sur le VRAI YouTube + cas d'erreur simulés.
// node --import ./e2e/ts-resolve.mjs --conditions=react-server --experimental-strip-types e2e/youtube-meta.test.mts
// Ce test ne concerne QUE les métadonnées : aucun fichier vidéo n'est récupéré.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchYouTubeMeta } from "../src/lib/youtube-meta";

const fake = (status: number, body = "{}") => (async () => new Response(body, { status })) as unknown as typeof fetch;

test("réel : vidéo publique → titre, chaîne, miniature", async () => {
  const m = await fetchYouTubeMeta("jNQXAC9IVRw");
  assert.equal(m.status, "ok");
  if (m.status !== "ok") return;
  assert.equal(m.title, "Me at the zoo");
  assert.equal(m.channel, "jawed");
  assert.equal(m.thumbnail, "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg");
  const img = await fetch(m.thumbnail);
  assert.equal(img.status, 200);
});
test("réel : identifiant inexistant → introuvable", async () => {
  assert.equal((await fetchYouTubeMeta("aaaaaaaaaaa")).status, "not_found");
});
test("simulé : 401 / 403 → privée ou non intégrable", async () => {
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(401))).status, "private");
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(403))).status, "private");
});
test("simulé : 404 → introuvable ; 500/429 → indisponible", async () => {
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(404))).status, "not_found");
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(500))).status, "unavailable");
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(429))).status, "unavailable");
});
test("simulé : erreur réseau / réponse invalide / trop grosse → indisponible", async () => {
  const boom = (async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch;
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", boom)).status, "unavailable");
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(200, "<html>"))).status, "unavailable");
  assert.equal((await fetchYouTubeMeta("dQw4w9WgXcQ", fake(200, "x".repeat(70000)))).status, "unavailable");
});
test("simulé : miniature malveillante ignorée, titre tronqué", async () => {
  const body = JSON.stringify({ title: "a".repeat(500), author_name: "c", thumbnail_url: "https://evil.example/x.jpg" });
  const m = await fetchYouTubeMeta("dQw4w9WgXcQ", fake(200, body));
  assert.ok(m.status === "ok" && m.thumbnail.startsWith("https://i.ytimg.com/vi/dQw4w9WgXcQ/") && m.title.length === 200);
});
test("identifiant invalide : aucun appel réseau", async () => {
  const never = (async () => { throw new Error("appel interdit"); }) as unknown as typeof fetch;
  assert.equal((await fetchYouTubeMeta("../../etc", never)).status, "not_found");
});
test("l'adresse appelée est toujours l'oEmbed officiel, sans suivre de redirection", async () => {
  let seen: [string, RequestInit] | null = null;
  const spy = (async (u: string, i: RequestInit) => ((seen = [u, i]), new Response("{}", { status: 200 }))) as unknown as typeof fetch;
  await fetchYouTubeMeta("dQw4w9WgXcQ", spy);
  assert.equal(seen![0], "https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ");
  assert.equal(seen![1].redirect, "error");
});

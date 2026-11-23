// Tests de la reconnaissance des liens YouTube : node --import ./e2e/ts-resolve.mjs --experimental-strip-types e2e/youtube-url.test.mts
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseYouTubeUrl } from "../src/lib/youtube-url";

const ID = "dQw4w9WgXcQ";
test("formats de liens acceptés", () => {
  for (const u of [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `http://m.youtube.com/watch?v=${ID}&feature=share`,
    `www.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abcDEF`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://music.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?v=${ID}&list=PL123`,
    `  https://www.youtube.com/watch?v=${ID}  `,
  ]) assert.deepEqual(parseYouTubeUrl(u), { ok: true, id: ID, isShort: false }, u);
  assert.deepEqual(parseYouTubeUrl(`https://www.youtube.com/shorts/${ID}`), { ok: true, id: ID, isShort: true });
});
test("liens refusés avec la bonne raison", () => {
  const cases: [string, string][] = [
    ["", "empty"],
    ["https://vimeo.com/123", "not_youtube"],
    ["https://evil.com/watch?v=" + ID, "not_youtube"],
    ["https://youtube.com.evil.com/watch?v=" + ID, "not_youtube"],
    ["https://evil.com/?u=https://youtube.com/watch?v=" + ID, "not_youtube"],
    ["javascript:alert(1)//youtube.com", "invalid"],
    ["file:///etc/passwd", "not_youtube"],
    ["https://www.youtube.com/playlist?list=PL123", "playlist"],
    ["https://www.youtube.com/watch?list=PL123", "playlist"],
    ["https://www.youtube.com/@clipera", "channel"],
    ["https://www.youtube.com/channel/UC123", "channel"],
    ["https://www.youtube.com/watch?v=abc", "invalid"],
    ["https://www.youtube.com/watch?v=" + ID + "x", "invalid"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXc%2F", "invalid"],
    ["https://youtu.be/", "invalid"],
    ["https://www.youtube.com/", "invalid"],
    ["https://user:pass@www.youtube.com:8080/watch?v=" + ID, "ok"],
  ];
  for (const [u, reason] of cases) {
    const r = parseYouTubeUrl(u);
    if (reason === "ok") assert.equal(r.ok, true, u);
    else assert.deepEqual(r, { ok: false, reason }, u);
  }
});
test("lien très long refusé", () => {
  assert.equal(parseYouTubeUrl("https://www.youtube.com/watch?v=" + ID + "&x=" + "a".repeat(3000)).ok, false);
});

// Detecta los reels con colaboración (coautor) y los guarda en lib/collabs.json + imágenes locales.
// Entrada: salida de apify/instagram-post-scraper (input: {"username":["elmonocuc0"],"resultsLimit":150})
// Opcional: TT_COLLABS=<archivo> con la salida de clockworks/tiktok-scraper (input {"postURLs":[...]}) para sumar colabs de TikTok.
// Uso:  SCAN_JSON=<archivo> [TT_COLLABS=<archivo>] node scripts/refresh-collabs.mjs
import fs from "node:fs";
import path from "node:path";

const OWNER = "elmonocuc0";
const file = process.env.SCAN_JSON;
if (!file) {
  console.error("Falta SCAN_JSON=<archivo con la salida de Apify>");
  process.exit(1);
}

// Cuenta aliada de cada video de TikTok (TikTok no expone coautores): id del video -> @cuenta
const TT_PARTNERS = {
  "7661169832959741205": "chuchoal_barril",
  "7627936399680867605": "ae_topsport",
  "7616615950418218261": "chuchoal_barril",
  "7607660523160685845": "corporaciondeportitanes",
};

const root = process.cwd();
const dir = path.join(root, "public", "fallback");
fs.mkdirSync(dir, { recursive: true });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const posts = JSON.parse(fs.readFileSync(file, "utf8"));
const collabs = posts
  .map((p) => ({ p, partners: (p.coauthorProducers || []).map((c) => c.username).filter((u) => u && u !== OWNER) }))
  .filter((x) => x.partners.length > 0)
  .sort((a, b) => new Date(b.p.timestamp) - new Date(a.p.timestamp));

const out = [];
for (const { p, partners } of collabs) {
  const name = `collab-${p.shortCode}.jpg`;
  const r = await fetch(p.displayUrl, { headers: { "User-Agent": UA, Referer: "https://www.instagram.com/" } });
  if (!r.ok) throw new Error(`${name} -> HTTP ${r.status}`);
  fs.writeFileSync(path.join(dir, name), Buffer.from(await r.arrayBuffer()));
  out.push({
    image: `/fallback/${name}`,
    url: `https://www.instagram.com/reel/${p.shortCode}/`,
    caption: (p.caption || "").split("\n")[0].slice(0, 90),
    isVideo: p.type === "Video",
    views: p.videoViewCount ?? p.videoPlayCount ?? undefined,
    likes: p.likesCount,
    partner: partners[0],
    platform: "instagram",
    date: p.timestamp,
  });
}

if (process.env.TT_COLLABS) {
  for (const v of JSON.parse(fs.readFileSync(process.env.TT_COLLABS, "utf8"))) {
    if (!v.authorMeta) continue;
    const name = `collab-tt-${v.id}.jpg`;
    const r = await fetch(v.videoMeta.originalCoverUrl || v.videoMeta.coverUrl, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`${name} -> HTTP ${r.status}`);
    fs.writeFileSync(path.join(dir, name), Buffer.from(await r.arrayBuffer()));
    out.push({
      image: `/fallback/${name}`,
      url: v.webVideoUrl,
      caption: (v.text || "").split("\n")[0].slice(0, 90),
      isVideo: true,
      views: v.playCount,
      likes: v.diggCount,
      partner: TT_PARTNERS[v.id],
      platform: "tiktok",
      date: v.createTimeISO,
    });
  }
  out.sort((a, b) => new Date(b.date) - new Date(a.date));
}

fs.writeFileSync(path.join(root, "lib", "collabs.json"), JSON.stringify(out, null, 2));

// Posts recientes para las métricas (más nuevo primero; así los fijados viejos no se cuelan)
const recent = posts
  .filter((p) => p.timestamp)
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 30)
  .map((p) => ({ date: p.timestamp, views: p.videoPlayCount ?? p.videoViewCount ?? undefined, likes: p.likesCount }));
fs.writeFileSync(path.join(root, "lib", "ig-recent.json"), JSON.stringify(recent, null, 2));
console.log(`✓ ${recent.length} posts recientes -> lib/ig-recent.json`);
console.log(`✓ ${out.length} colaboraciones -> lib/collabs.json`);
for (const c of out) console.log(`  ${c.date.slice(0, 10)} @${c.partner} ${c.url}`);

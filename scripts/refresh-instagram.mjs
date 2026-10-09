// Actualiza los datos de Instagram desde la Graph API oficial (reemplaza a refresh-ig.mjs, que hacía scraping).
// Escribe: lib/ig-fallback.json (perfil + últimos reels), lib/ig-recent.json (vistas/likes para promedios),
//          lib/collabs.json (actualiza vistas/likes de las colaboraciones de IG), public/fallback/*.jpg, app/icon.jpg
// Variables (.env.local):  META_ACCESS_TOKEN, IG_USER_ID
// Uso:  node --env-file=.env.local scripts/refresh-instagram.mjs
import fs from "node:fs";
import path from "node:path";

const API = "https://graph.facebook.com/v21.0";
const { META_ACCESS_TOKEN: TOKEN, IG_USER_ID } = process.env;
if (!TOKEN || !IG_USER_ID) {
  console.error("Faltan META_ACCESS_TOKEN o IG_USER_ID en .env.local");
  process.exit(1);
}

const root = process.cwd();
const fallbackDir = path.join(root, "public", "fallback");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "lib", f), "utf8"));
const write = (f, data) => fs.writeFileSync(path.join(root, "lib", f), JSON.stringify(data, null, 2));
fs.mkdirSync(fallbackDir, { recursive: true });

async function get(pathOrUrl, { soft = false } = {}) {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${API}/${pathOrUrl}${pathOrUrl.includes("?") ? "&" : "?"}access_token=${TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) {
    if (soft) return null;
    console.error(`Error de la API (${res.status}): ${json.error?.message ?? JSON.stringify(json)}`);
    process.exit(1);
  }
  return json;
}

async function download(url, file) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${path.basename(file)} -> HTTP ${r.status}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

const fmt = (n) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M"
    : n >= 1_000
      ? (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K"
      : String(n);
const shortcode = (permalink) => permalink.match(/\/(?:reel|p|tv)\/([^/?]+)/)?.[1];

// ---------- Perfil ----------
const u = await get(`${IG_USER_ID}?fields=username,name,biography,followers_count,media_count,profile_picture_url`);

// ---------- Publicaciones (todas, paginadas; solo metadatos) ----------
const fields = "id,media_type,permalink,timestamp,like_count,comments_count,thumbnail_url,media_url,caption";
let page = await get(`${IG_USER_ID}/media?fields=${fields}&limit=100`);
const media = [...page.data];
while (page.paging?.next && media.length < 600) {
  page = await get(page.paging.next);
  media.push(...page.data);
}
media.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// ---------- Vistas por publicación (1 llamada por post) ----------
const views = new Map();
async function loadViews(m) {
  if (views.has(m.id)) return;
  const r = await get(`${m.id}/insights?metric=views`, { soft: true });
  views.set(m.id, r?.data?.[0]?.values?.[0]?.value);
}

const collabs = read("collabs.json");
const collabCodes = new Set(collabs.filter((c) => c.platform === "instagram").map((c) => shortcode(c.url)));
const recent = media.slice(0, 30);
const collabMedia = media.filter((m) => collabCodes.has(shortcode(m.permalink)));
for (const m of new Set([...recent, ...collabMedia])) await loadViews(m);

// ---------- Imágenes: perfil (+ favicon) y miniaturas de los 12 últimos ----------
await download(u.profile_picture_url, path.join(fallbackDir, "profile.jpg"));
fs.copyFileSync(path.join(fallbackDir, "profile.jpg"), path.join(root, "app", "icon.jpg"));

const posts = [];
for (const [i, m] of media.slice(0, 12).entries()) {
  const file = `post-${i}.jpg`;
  await download(m.thumbnail_url || m.media_url, path.join(fallbackDir, file));
  if (!views.has(m.id)) await loadViews(m);
  posts.push({
    image: `/fallback/${file}`,
    url: m.permalink,
    caption: (m.caption || "").split("\n")[0].slice(0, 90),
    isVideo: m.media_type === "VIDEO",
    date: new Date(m.timestamp).toISOString(),
    views: views.get(m.id),
    likes: m.like_count,
  });
}

// ---------- ig-fallback.json: se conserva lo que la API no da (nombre, categoría, enlaces) ----------
const prev = read("ig-fallback.json");
const stat = (label, value) => ({ value, label });
const profile = {
  ...prev,
  bio: u.biography ?? prev.bio,
  avatar: "/fallback/profile.jpg",
  stats: prev.stats.map((s) =>
    s.label === "Seguidores"
      ? stat(s.label, fmt(u.followers_count))
      : s.label === "Publicaciones"
        ? stat(s.label, fmt(u.media_count))
        : s,
  ),
  featured: posts[0] ?? null,
  posts,
};
write("ig-fallback.json", profile);

// ---------- ig-recent.json: videos recientes con vistas, para los promedios ----------
const recentVideos = recent
  .filter((m) => m.media_type === "VIDEO" && views.get(m.id) != null)
  .map((m) => ({ date: new Date(m.timestamp).toISOString(), views: views.get(m.id), likes: m.like_count }));
write("ig-recent.json", recentVideos);

// ---------- collabs.json: refresca vistas/likes de las colaboraciones de IG ----------
let updated = 0;
const byCode = new Map(collabMedia.map((m) => [shortcode(m.permalink), m]));
for (const c of collabs) {
  const m = c.platform === "instagram" && byCode.get(shortcode(c.url));
  if (!m) continue;
  c.views = views.get(m.id) ?? c.views;
  c.likes = m.like_count ?? c.likes;
  updated++;
}
write("collabs.json", collabs);

console.log(`✓ @${u.username}: ${fmt(u.followers_count)} seguidores · ${u.media_count} publicaciones`);
console.log(`  ${posts.length} reels (último: "${posts[0]?.caption}") · ${recentVideos.length} videos con vistas · ${updated}/${collabCodes.size} colabs actualizadas`);

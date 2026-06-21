// Refresca el "fallback" con los datos e imágenes actuales de Instagram.
// Uso:  node scripts/refresh-ig.mjs   (correr desde un PC, no desde Vercel)
import fs from "node:fs";
import path from "node:path";

const USERNAME = "elmonocuc0";
const IG_APP_ID = "936619743392459";
const CUSTOM_STAT = { value: "Cartagena", label: "Ciudad" };
const EXTRA_LINKS = [
  { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/Elmonocuco01/" },
];

const root = process.cwd();
const fallbackDir = path.join(root, "public", "fallback");
fs.mkdirSync(fallbackDir, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function platformFromUrl(url) {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("instagram.com")) return "instagram";
  return "web";
}
const LABELS = {
  instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube",
  linkedin: "LinkedIn", x: "X", facebook: "Facebook", whatsapp: "WhatsApp", web: "Sitio web",
};
function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}
function reel(sc) { return `https://www.instagram.com/reel/${sc}/`; }

async function dl(url, file) {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, Referer: "https://www.instagram.com/", Accept: "image/*,*/*" },
  });
  if (!r.ok) throw new Error(`${file} -> HTTP ${r.status}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

let u;
const localJson = process.env.IG_JSON; // opcional: ruta a un JSON ya descargado
if (localJson) {
  u = JSON.parse(fs.readFileSync(localJson, "utf8")).data.user;
  console.log("(usando JSON local:", localJson + ")");
} else {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
    { headers: { "x-ig-app-id": IG_APP_ID, "User-Agent": UA, Accept: "*/*" } }
  );
  if (!res.ok) {
    console.error("ERROR: Instagram respondió", res.status, "- reintenta en un rato o pasa IG_JSON=<archivo>.");
    process.exit(1);
  }
  u = (await res.json()).data.user;
}

const followers = u.edge_followed_by?.count ?? 0;
const following = u.edge_follow?.count ?? 0;
const postsCount = u.edge_owner_to_timeline_media?.count ?? 0;
const edges = (u.edge_owner_to_timeline_media?.edges ?? []).slice(0, 9);

// descargar foto de perfil (+ favicon) y thumbnails
await dl(u.profile_pic_url_hd || u.profile_pic_url, path.join(fallbackDir, "profile.jpg"));
fs.copyFileSync(path.join(fallbackDir, "profile.jpg"), path.join(root, "app", "icon.jpg"));
const posts = [];
for (let i = 0; i < edges.length; i++) {
  const n = edges[i].node;
  const file = `post-${i}.jpg`;
  await dl(n.display_url, path.join(fallbackDir, file));
  posts.push({
    image: `/fallback/${file}`,
    url: reel(n.shortcode),
    caption: (n.edge_media_to_caption?.edges?.[0]?.node?.text || "").split("\n")[0].slice(0, 90),
    isVideo: n.is_video,
    views: n.video_view_count,
    likes: n.edge_media_preview_like?.count,
  });
}

// socials: instagram + bio_links + extras (dedupe por plataforma)
const socials = [
  { platform: "instagram", label: "Instagram", url: `https://www.instagram.com/${USERNAME}/` },
];
for (const b of u.bio_links || []) {
  const url = b.url || b.lynx_url;
  if (!url) continue;
  const platform = platformFromUrl(url);
  socials.push({ platform, label: (b.title || LABELS[platform] || platform).trim(), url });
}
for (const e of EXTRA_LINKS) socials.push(e);
const seen = new Set();
const dedupSocials = socials.filter((s) => (seen.has(s.platform) ? false : (seen.add(s.platform), true)));

const profile = {
  username: u.username,
  name: u.full_name.split("|")[0].trim() || u.username,
  tagline: u.category_name || (u.biography.split("\n").find((l) => l.trim()) || "Creador de contenido"),
  bio: u.biography,
  verified: u.is_verified,
  avatar: "/fallback/profile.jpg",
  stats: [
    { value: fmt(followers), label: "Seguidores" },
    { value: fmt(postsCount), label: "Publicaciones" },
    { value: fmt(following), label: "Seguidos" },
    { value: CUSTOM_STAT.value, label: CUSTOM_STAT.label },
  ],
  socials: dedupSocials,
  featured: posts[0] ?? null,
  posts,
};

fs.writeFileSync(
  path.join(root, "lib", "ig-fallback.json"),
  JSON.stringify(profile, null, 2)
);

console.log("✓ Fallback actualizado:");
console.log(`  ${profile.name} · ${fmt(followers)} seguidores · ${postsCount} posts`);
console.log(`  ${posts.length} reels descargados, último: "${posts[0]?.caption}"`);
console.log("  -> lib/ig-fallback.json + public/fallback/*.jpg + app/icon.jpg");

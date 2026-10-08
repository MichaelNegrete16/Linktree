// Guarda los datos públicos de TikTok en lib/tiktok.json.
// Entrada: salida de clockworks/tiktok-scraper
//   input: {"profiles":["elmonocuc0"],"resultsPerPage":12,"profileScrapeSections":["videos"],"profileSorting":"latest"}
// Uso:  TT_JSON=<archivo> node scripts/refresh-tiktok.mjs
import fs from "node:fs";
import path from "node:path";

const file = process.env.TT_JSON;
if (!file) {
  console.error("Falta TT_JSON=<archivo con la salida de Apify>");
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(file, "utf8"));
const meta = items[0]?.authorMeta;
if (!meta) {
  console.error("El archivo no trae authorMeta (¿corrió bien el actor?)");
  process.exit(1);
}

const out = {
  username: meta.name,
  url: `https://www.tiktok.com/@${meta.name}`,
  followers: meta.fans,
  following: meta.following,
  likes: meta.heart,
  videos: meta.video,
  // más nuevo primero (Apify pone antes los fijados)
  posts: items
    .map((v) => ({
      url: v.webVideoUrl,
      date: v.createTimeISO,
      views: v.playCount,
      likes: v.diggCount,
      comments: v.commentCount,
      shares: v.shareCount,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)),
};

fs.writeFileSync(path.join(process.cwd(), "lib", "tiktok.json"), JSON.stringify(out, null, 2));
console.log(`✓ TikTok @${out.username}: ${out.followers} seguidores · ${out.likes} likes · ${out.posts.length} videos -> lib/tiktok.json`);

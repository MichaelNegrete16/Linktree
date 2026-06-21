import { platformFromUrl, profileConfig } from "@/lib/config";
import fallbackData from "@/lib/ig-fallback.json";

export type SocialLink = {
  platform: string;
  label: string;
  url: string;
};
export type Post = {
  image: string;
  url: string;
  caption: string;
  isVideo: boolean;
  views?: number;
  likes?: number;
};
export type Stat = { value: string; label: string };
export type Profile = {
  username: string;
  name: string;
  tagline: string;
  bio: string;
  verified: boolean;
  avatar: string;
  stats: Stat[];
  socials: SocialLink[];
  featured: Post | null;
  posts: Post[];
  live: boolean;
};

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function proxy(url: string): string {
  return `/api/ig-image?u=${encodeURIComponent(url)}`;
}

function reelUrl(shortcode: string): string {
  return `https://www.instagram.com/reel/${shortcode}/`;
}

function labelFor(platform: string): string {
  return profileConfig.labels[platform] || platform;
}

function buildSocials(bioLinks: { title?: string; url: string }[]): SocialLink[] {
  const out: SocialLink[] = [
    {
      platform: "instagram",
      label: "Instagram",
      url: `https://www.instagram.com/${profileConfig.username}/`,
    },
  ];
  for (const b of bioLinks) {
    if (!b.url) continue;
    const platform = platformFromUrl(b.url);
    out.push({ platform, label: b.title?.trim() || labelFor(platform), url: b.url });
  }
  for (const e of profileConfig.extraLinks) {
    out.push({ platform: e.platform, label: e.label, url: e.url });
  }
  // dedupe por plataforma (primera gana)
  const seen = new Set<string>();
  return out.filter((s) => (seen.has(s.platform) ? false : (seen.add(s.platform), true)));
}

function tagline(bio: string, category?: string | null): string {
  if (category) return category;
  const firstLine = bio.split("\n").map((l) => l.trim()).filter(Boolean)[0];
  return firstLine || "Creador de contenido";
}

// ---------------- Fallback ----------------
// Generado con `npm run refresh:ig` (datos + imágenes locales en /public/fallback).
const FALLBACK: Profile = {
  ...(fallbackData as Omit<Profile, "live">),
  live: false,
};

// ---------------- Live fetch ----------------
type IgUser = {
  username: string;
  full_name: string;
  biography: string;
  is_verified: boolean;
  category_name?: string | null;
  profile_pic_url: string;
  profile_pic_url_hd?: string;
  edge_followed_by?: { count: number };
  edge_follow?: { count: number };
  edge_owner_to_timeline_media?: {
    count: number;
    edges: {
      node: {
        shortcode: string;
        display_url: string;
        is_video: boolean;
        video_view_count?: number;
        edge_media_preview_like?: { count: number };
        edge_media_to_caption?: { edges: { node: { text: string } }[] };
      };
    }[];
  };
  bio_links?: { title?: string; url?: string; lynx_url?: string }[];
};

function normalize(user: IgUser): Profile {
  const followers = user.edge_followed_by?.count ?? 0;
  const following = user.edge_follow?.count ?? 0;
  const postsCount = user.edge_owner_to_timeline_media?.count ?? 0;

  const media = user.edge_owner_to_timeline_media?.edges ?? [];
  const posts: Post[] = media.slice(0, 9).map((e) => ({
    image: proxy(e.node.display_url),
    url: reelUrl(e.node.shortcode),
    caption: (e.node.edge_media_to_caption?.edges?.[0]?.node?.text || "")
      .split("\n")[0]
      .slice(0, 90),
    isVideo: e.node.is_video,
    views: e.node.video_view_count,
    likes: e.node.edge_media_preview_like?.count,
  }));

  const bioLinks = (user.bio_links || [])
    .map((b) => ({ title: b.title, url: (b.url || b.lynx_url || "") as string }))
    .filter((b) => b.url);

  const cleanName = user.full_name.split("|")[0].trim() || user.username;

  return {
    username: user.username,
    name: cleanName,
    tagline: tagline(user.biography, user.category_name),
    bio: user.biography,
    verified: user.is_verified,
    avatar: proxy(user.profile_pic_url_hd || user.profile_pic_url),
    stats: [
      { value: formatCount(followers), label: "Seguidores" },
      { value: formatCount(postsCount), label: "Publicaciones" },
      { value: formatCount(following), label: "Seguidos" },
      { value: profileConfig.customStat.value, label: profileConfig.customStat.label },
    ],
    socials: buildSocials(bioLinks),
    featured: posts[0] ?? null,
    posts,
    live: true,
  };
}

export async function getProfile(): Promise<Profile> {
  try {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${profileConfig.username}`,
      {
        headers: {
          "x-ig-app-id": profileConfig.igAppId,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "*/*",
          "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
        },
        next: { revalidate: profileConfig.revalidateSeconds },
      }
    );
    if (!res.ok) return FALLBACK;
    const json = await res.json();
    const user: IgUser | undefined = json?.data?.user;
    if (!user || !user.username) return FALLBACK;
    return normalize(user);
  } catch {
    return FALLBACK;
  }
}

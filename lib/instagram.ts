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
  partner?: string;
  platform?: "instagram" | "tiktok";
  date?: string;
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
};

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

// ---------------- Datos ----------------
// Generado con `npm run refresh:instagram` (Graph API de Meta; datos + imágenes locales en /public/fallback).
const FALLBACK = fallbackData as Profile;

export async function getProfile(): Promise<Profile> {
  return FALLBACK;
}

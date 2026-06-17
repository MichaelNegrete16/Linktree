// Configuración estática (lo que NO viene de Instagram o que quieras forzar).
export const profileConfig = {
  username: "elmonocuc0",
  brandLabel: "EL MONOCUCO",
  // App id público que usa la web de Instagram para su endpoint web_profile_info
  igAppId: "936619743392459",
  // cada cuánto se refrescan los datos desde Instagram (segundos)
  revalidateSeconds: 3600,

  // CTA principal (botón blanco)
  cta: {
    label: "Escríbeme por Instagram",
    url: "https://ig.me/m/elmonocuc0",
    icon: "mail",
  },

  // 4ta tarjeta de stats (IG da seguidores/publicaciones/seguidos)
  customStat: { value: "Cartagena", label: "Ciudad" },

  // Enlaces extra a fusionar además de Instagram + los bio_links de IG
  extraLinks: [
    {
      platform: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/Elmonocuco01/",
    },
  ] as {
    platform: string;
    label: string;
    url: string;
  }[],

  // icono (Material Symbols) por plataforma
  icons: {
    instagram: "photo_camera",
    tiktok: "play_circle",
    youtube: "video_library",
    linkedin: "work",
    x: "close",
    facebook: "thumb_up",
    whatsapp: "chat",
    web: "language",
    default: "link",
  } as Record<string, string>,

  labels: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    x: "X",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    web: "Sitio web",
  } as Record<string, string>,
};

export function platformFromUrl(url: string): string {
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

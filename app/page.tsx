import Background from "@/components/Background";
import CountUp from "@/components/CountUp";
import FloatCta from "@/components/FloatCta";
import Loader from "@/components/Loader";
import Marquee from "@/components/Marquee";
import ReelsRail from "@/components/ReelsRail";
import Reveal from "@/components/Reveal";
import Spot from "@/components/Spot";
import collabsData from "@/lib/collabs.json";
import igRecentData from "@/lib/ig-recent.json";
import tiktokData from "@/lib/tiktok.json";
import { getProfile, formatCount } from "@/lib/instagram";
import type { Post } from "@/lib/instagram";
import { profileConfig } from "@/lib/config";

export const revalidate = 3600;


export default async function Home() {
  const p = await getProfile();
  const icon = (platform: string) => profileConfig.icons[platform] || profileConfig.icons.default;
  // Generado con `scripts/refresh-collabs.mjs` (reels con coautor), del más nuevo al más viejo
  const collabPosts = collabsData as Post[];
  // Métricas: promedio de vistas y reacciones (likes) de los últimos 5 videos de cada red con al menos
  // 48 h de vida (los recién subidos aún no acumulan nada). Listas ordenadas por fecha, nuevo primero.
  const MATURE_MS = 48 * 3600 * 1000;
  type Sample = { views?: number; likes?: number; date?: string };
  const last5 = (list: Sample[]) =>
    list
      .filter((x) => x.views != null && (!x.date || Date.now() - new Date(x.date).getTime() >= MATURE_MS))
      .slice(0, 5);
  const avgOf = (l: Sample[], k: "views" | "likes") =>
    l.length ? Math.round(l.reduce((s, x) => s + (x[k] ?? 0), 0) / l.length) : 0;
  const igRecent = last5(igRecentData as Sample[]);
  const ttRecent = last5(tiktokData.posts as Sample[]);
  const allRecent = [...igRecent, ...ttRecent];
  const networks = [
    { name: "Instagram", icon: "photo_camera", views: avgOf(igRecent, "views"), likes: avgOf(igRecent, "likes"), url: `https://www.instagram.com/${p.username}/` },
    { name: "TikTok", icon: "play_circle", views: avgOf(ttRecent, "views"), likes: avgOf(ttRecent, "likes"), url: tiktokData.url },
  ];
  const metrics =
    allRecent.length > 0
      ? [
          { value: formatCount(avgOf(allRecent, "views")), label: "Vistas promedio" },
          { value: formatCount(avgOf(allRecent, "likes")), label: "Reacciones promedio" },
        ]
      : [];
  const nameWords = p.name.split(" ");
  const bioLines = p.bio.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <>
      <Loader />
      <Background />

      {/* ---------- Nav flotante ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 px-[var(--pad)] pt-4 hero-fade" style={{ ["--d" as string]: "2.6s" }}>
        <nav className="glass mx-auto flex w-full max-w-[1280px] items-center justify-between rounded-full px-5 py-3 md:px-7">
          <span className="font-display text-sm font-extrabold uppercase tracking-[0.3em] text-primary md:text-base">
            {profileConfig.brandLabel}
          </span>
          <a
            href={`https://www.instagram.com/${p.username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-gold transition-all duration-500 hover:bg-gold hover:text-on-primary"
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            Seguir
          </a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1280px] px-[var(--pad)] pb-28 pt-28 md:pt-32">
        <div className="grid gap-14 lg:grid-cols-[minmax(360px,460px)_1fr] lg:gap-16">
          {/* ================= Columna izquierda: perfil ================= */}
          <div className="flex flex-col gap-10 [@media(min-width:1024px)_and_(min-height:900px)]:sticky [@media(min-width:1024px)_and_(min-height:900px)]:top-24 lg:self-start">
            <header className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <div className="hero-fade relative" style={{ ["--d" as string]: "2.1s" }}>
                <div className="ring h-36 w-36 md:h-44 md:w-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.avatar} alt={p.name} className="h-full w-full rounded-full border-4 border-background object-cover" />
                </div>
                {p.verified && (
                  <div className="absolute bottom-1 right-1 rounded-full bg-background p-1">
                    <span className="material-symbols-outlined text-[24px] text-gold" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4 lg:items-start">
                <p className="eyebrow hero-fade" style={{ ["--d" as string]: "2.2s" }}>
                  {p.tagline}
                </p>
                <h1 className="h-name text-primary [text-shadow:0_2px_30px_rgba(0,0,0,0.6)]">
                  {nameWords.map((w, i) => {
                    const last = i === nameWords.length - 1 && nameWords.length > 1;
                    return (
                      <span key={i} className="block lg:inline-block lg:mr-[0.2em]">
                        <span className={`hw ${last ? "accent" : ""}`} style={{ ["--i" as string]: i }}>
                          {w}
                        </span>
                      </span>
                    );
                  })}
                </h1>
                {bioLines.length > 0 && (
                  <ul className="mt-1 flex max-w-md flex-col gap-1.5 text-body-md text-on-surface/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
                    {bioLines.map((l, i) => (
                      <li key={i} className="hero-fade" style={{ ["--d" as string]: `${2.7 + i * 0.12}s` }}>
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </header>

            {/* Stats */}
            <Reveal>
              <section className="grid grid-cols-2 gap-3">
                {p.stats.map((s) => (
                  <Spot key={s.label} className="glass rounded-2xl p-5">
                    <span className="block font-display font-bold leading-none text-primary text-[1.55rem] min-[400px]:text-3xl md:text-[2rem]">
                      <CountUp value={s.value} />
                    </span>
                    <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-gold-hi/80">
                      {s.label}
                    </span>
                  </Spot>
                ))}
              </section>
            </Reveal>

            {/* Enlaces */}
            <section className="flex flex-col gap-3">
              {p.socials.map((s, i) => (
                <Reveal key={s.platform + s.url} delay={i * 90}>
                  <Spot href={s.url} className="glass group flex w-full items-center justify-between rounded-full py-3 pl-3 pr-6">
                    <div className="flex items-center gap-4">
                      <span className="linkicon">
                        <span className="material-symbols-outlined text-[22px]">{icon(s.platform)}</span>
                      </span>
                      <span className="font-display text-lg font-semibold text-primary">{s.label}</span>
                    </div>
                    <span className="material-symbols-outlined linkarrow text-on-surface-variant">arrow_forward</span>
                  </Spot>
                </Reveal>
              ))}
            </section>
          </div>

          {/* ================= Columna derecha: contenido ================= */}
          <div className="flex min-w-0 flex-col gap-14">
            {/* Destacado */}
            {p.featured && (
              <Reveal>
                <section className="flex flex-col gap-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="eyebrow mb-3">Última publicación</span>
                      <h2 className="h-sec">
                        Lo más <span className="accent">reciente</span>
                      </h2>
                    </div>
                  </div>
                  <div className="glowframe">
                    <a
                      href={p.featured.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block overflow-hidden rounded-[21px] bg-surface"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.featured.image}
                          alt={p.featured.caption || "Última publicación"}
                          className="h-full w-full object-cover transition-transform duration-[1500ms] ease-lux group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <span className="absolute left-5 top-5 rounded-full border border-gold/50 bg-background/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold backdrop-blur-md">
                          Destacado
                        </span>
                        <span className="absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-background/40 backdrop-blur-md transition-all duration-700 ease-lux group-hover:scale-110 group-hover:border-transparent group-hover:bg-gold group-hover:text-on-primary">
                          <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                        </span>
                        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 md:p-8">
                          {p.featured.caption && (
                            <h3 className="line-clamp-2 max-w-xl font-display text-2xl font-semibold tracking-tight text-primary md:text-3xl">
                              {p.featured.caption}
                            </h3>
                          )}
                          <div className="flex items-center gap-5 font-mono text-sm">
                            {p.featured.views != null && (
                              <span className="flex items-center gap-1.5 text-gold-hi">
                                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  play_arrow
                                </span>
                                {formatCount(p.featured.views)}
                              </span>
                            )}
                            {p.featured.likes != null && (
                              <span className="flex items-center gap-1.5 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  favorite
                                </span>
                                {formatCount(p.featured.likes)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </section>
              </Reveal>
            )}

            {/* Reels */}
            {p.posts.length > 1 && (
              <Reveal>
                <section className="flex flex-col">
                  <div className="mb-5">
                    <span className="eyebrow mb-3">Reels</span>
                    <h2 className="h-sec">
                      Mira los <span className="accent">últimos</span>
                    </h2>
                  </div>
                  <ReelsRail posts={p.posts} />
                </section>
              </Reveal>
            )}

            {/* Métricas */}
            {metrics.length > 0 && (
              <Reveal>
                <section className="flex flex-col">
                  <div className="mb-5">
                    <span className="eyebrow mb-3">Alcance</span>
                    <h2 className="h-sec">
                      La gente que <span className="accent">le llega</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {metrics.map((m) => (
                      <Spot key={m.label} className="glass rounded-2xl p-5">
                        <span className="block font-display font-bold leading-none text-primary text-[1.55rem] min-[400px]:text-3xl">
                          <CountUp value={m.value} />
                        </span>
                        <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-gold-hi/80">
                          {m.label}
                        </span>
                      </Spot>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {networks.map((n) => (
                      <Spot key={n.name} href={n.url} className="glass rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          <span className="linkicon">
                            <span className="material-symbols-outlined text-[22px]">{n.icon}</span>
                          </span>
                          <span className="font-display text-lg font-semibold text-primary">{n.name}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {[
                            { v: n.views, l: "Vistas prom." },
                            { v: n.likes, l: "Reacciones prom." },
                          ].map((x) => (
                            <div key={x.l}>
                              <span className="block font-display text-2xl font-bold text-primary">{formatCount(x.v)}</span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-hi/80">{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </Spot>
                    ))}
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/70">
                    Datos públicos · promedio de los últimos 5 videos de cada red
                  </p>
                </section>
              </Reveal>
            )}

            {/* Colaboraciones */}
            {collabPosts.length > 0 && (
              <Reveal>
                <section className="flex flex-col">
                  <div className="mb-5">
                    <span className="eyebrow mb-3">Colaboraciones</span>
                    <h2 className="h-sec">
                      Marcas y páginas que <span className="accent">ya confían</span>
                    </h2>
                  </div>
                  <ReelsRail posts={collabPosts} />
                  <a
                    href={profileConfig.cta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 self-start font-mono text-[12px] uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-hi"
                  >
                    ¿Quieres colaborar con el Mono? Escríbele
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                </section>
              </Reveal>
            )}

            {/* CTA */}
            <Reveal>
              <section id="cta-main" className="glass relative overflow-hidden rounded-[28px] p-8 text-center md:p-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
                <span className="eyebrow mb-5 justify-center">Hablemos</span>
                <h2 className="h-sec mx-auto max-w-md !text-[clamp(1.8rem,3.4vw,2.8rem)]">
                  ¿Una colaboración con <span className="accent">sabor costeño</span>?
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-body-md text-on-surface-variant">
                  Escríbeme directo por Instagram y armamos algo bien chimba.
                </p>
                <a
                  href={profileConfig.cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta mx-auto mt-8 max-w-sm"
                >
                  <span className="material-symbols-outlined">{profileConfig.cta.icon}</span>
                  {profileConfig.cta.label}
                </a>
              </section>
            </Reveal>
          </div>
        </div>
      </main>

      <Marquee items={profileConfig.marquee} />

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 flex flex-col items-center gap-5 px-[var(--pad)] pb-28 pt-14 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/elpanajackson.png"
          alt='By "ElPanaJackson"'
          className="h-auto w-48 opacity-90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-opacity duration-300 hover:opacity-100 md:w-56"
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-on-surface-variant/70">
          © {new Date().getFullYear()} {profileConfig.brandLabel} · Hecho en {p.username === "elmonocuc0" ? "Cartagena" : "Colombia"}
        </p>
      </footer>

      <FloatCta href={profileConfig.cta.url} label={profileConfig.cta.label} icon={profileConfig.cta.icon} />
    </>
  );
}

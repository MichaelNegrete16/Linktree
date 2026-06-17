import Background from "@/components/Background";
import { getProfile } from "@/lib/instagram";
import { profileConfig } from "@/lib/config";

export const revalidate = 3600;

export default async function Home() {
  const p = await getProfile();
  const icon = (platform: string) =>
    profileConfig.icons[platform] || profileConfig.icons.default;

  return (
    <>
      <Background />

      {/* Top nav */}
      <nav className="sticky top-0 z-50 w-full max-w-[680px] mx-auto px-gutter">
        <div className="glass-card border-x-0 border-t-0 flex justify-center items-center py-4">
          <span className="font-display font-extrabold text-headline-sm tracking-tighter text-primary uppercase">
            {profileConfig.brandLabel}
          </span>
        </div>
      </nav>

      <main className="w-full max-w-[680px] mx-auto px-gutter pt-12 pb-10 flex flex-col gap-10 md:gap-12 relative z-10">
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-6">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 border border-white/20 glass-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.avatar}
              alt={p.name}
              className="w-full h-full object-cover rounded-full"
            />
            {p.verified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-1">
                <span
                  className="material-symbols-outlined text-[24px] gold-text"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 items-center">
            <h1 className="font-display font-bold text-display-mobile md:text-display-lg text-primary tracking-tighter [text-shadow:0_2px_18px_rgba(0,0,0,0.7)]">
              {p.name}
            </h1>
            <p className="font-mono text-label-caps text-secondary tracking-widest accent-glow uppercase">
              {p.tagline}
            </p>
            {p.bio && (
              <p className="font-body text-body-md text-on-surface/90 max-w-md whitespace-pre-line [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
                {p.bio}
              </p>
            )}
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          {p.stats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-6 flex flex-col items-center text-center"
            >
              <span className="font-mono text-headline-md text-primary mb-1 accent-glow">
                {s.value}
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                {s.label}
              </span>
            </div>
          ))}
        </section>

        {/* Social links */}
        <section className="flex flex-col gap-3">
          {p.socials.map((s) => (
            <a
              key={s.platform + s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-hover shimmer rounded-full py-4 px-6 flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">
                  {icon(s.platform)}
                </span>
                <span className="font-display font-semibold text-body-lg text-primary">
                  {s.label}
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors duration-300">
                arrow_forward
              </span>
            </a>
          ))}
        </section>

        {/* Featured */}
        {p.featured && (
          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest pl-2">
              Última publicación
            </h2>
            <a
              href={p.featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-hover gold-accent rounded-xl overflow-hidden group cursor-pointer block"
            >
              <div className="relative w-full h-64 md:h-80 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.featured.image}
                  alt={p.featured.caption || "Última publicación"}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 flex flex-col gap-2">
                  <span className="font-mono text-[10px] gold-text uppercase tracking-widest border border-gold/40 px-2 py-1 rounded w-max">
                    Destacado
                  </span>
                  {p.featured.caption && (
                    <h3 className="font-display font-semibold text-headline-sm text-primary max-w-md line-clamp-2">
                      {p.featured.caption}
                    </h3>
                  )}
                </div>
                <div className="absolute top-4 right-4 bg-background/50 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-primary">
                    open_in_new
                  </span>
                </div>
              </div>
            </a>
          </section>
        )}

        {/* Recent posts grid */}
        {p.posts.length > 1 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest pl-2">
              Reels recientes
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {p.posts.map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-[9/16] rounded-lg overflow-hidden glass-card group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.caption || `Reel ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="material-symbols-outlined absolute top-2 right-2 text-primary text-[18px] drop-shadow">
                    play_circle
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="pt-2">
          <a
            href={profileConfig.cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary text-on-primary font-display font-semibold text-body-lg py-5 rounded-full hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_40px_rgba(255,154,60,0.18)] flex items-center justify-center gap-3 relative overflow-hidden group border border-gold/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="material-symbols-outlined">{profileConfig.cta.icon}</span>
            {profileConfig.cta.label}
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[680px] mx-auto px-gutter pt-2 pb-12 flex flex-col items-center gap-4 text-center relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/elpanajackson.png"
          alt='By "ElPanaJackson"'
          className="w-48 md:w-56 h-auto opacity-90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-opacity duration-300 hover:opacity-100"
        />
        <p className="font-mono text-label-caps text-on-surface-variant/70 uppercase">
          © {new Date().getFullYear()} {profileConfig.brandLabel}
        </p>
      </footer>
    </>
  );
}

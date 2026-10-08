export default function Marquee({ items }: { items: string[] }) {
  const track = (
    <div className="marquee__track" aria-hidden>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span
            className={
              i % 2 === 0
                ? "font-display text-2xl font-bold uppercase tracking-[-0.02em] text-primary/90 md:text-4xl"
                : "accent text-3xl md:text-5xl"
            }
          >
            {t}
          </span>
          <span className="text-gold text-xl">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee border-y border-white/10 bg-background/40 py-5 backdrop-blur-sm" role="presentation">
      {track}
      {track}
    </div>
  );
}

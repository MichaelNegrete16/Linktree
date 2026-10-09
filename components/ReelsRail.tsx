"use client";

import { useRef } from "react";
import type { Post } from "@/lib/instagram";
import { formatCount } from "@/lib/instagram";

export default function ReelsRail({ posts }: { posts: Post[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (d: number) =>
    rail.current?.scrollBy({ left: d * Math.min(640, window.innerWidth * 0.8), behavior: "smooth" });

  return (
    <div className="relative">
      <div className="mb-5 hidden items-center justify-end gap-3 lg:flex">
        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => scroll(d)}
            aria-label={d < 0 ? "Anterior" : "Siguiente"}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-background/40 backdrop-blur-md transition-all duration-500 hover:border-gold hover:bg-gold hover:text-on-primary"
          >
            <span className="material-symbols-outlined">{d < 0 ? "arrow_back" : "arrow_forward"}</span>
          </button>
        ))}
      </div>

      <div ref={rail} className="rail">
        {posts.map((post, i) => (
          <a
            key={i}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="reel group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.caption || `Reel ${i + 1}`} loading="lazy" />
            <div
              className={`absolute inset-0 bg-gradient-to-t to-background/20 ${
                post.platform ? "from-background/95 via-background/30" : "from-background/90 via-transparent"
              }`}
            />
            <span className="material-symbols-outlined absolute right-3 top-3 text-[22px] text-primary drop-shadow">
              play_circle
            </span>
            {post.platform ? (
              <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-gold px-3 py-1.5 font-display text-[12px] font-extrabold tracking-wide text-on-primary shadow-lg">
                {post.partner ? `@${post.partner}` : "Colab"}
              </span>
            ) : (
              <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-3">
              {post.platform && (
                <p className="mb-2 inline-flex items-center rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-hi backdrop-blur-sm">
                  {post.platform === "tiktok" ? "TikTok" : post.platform === "instagram" ? "Instagram" : "Colaboración"}
                </p>
              )}
              {post.caption && (
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-primary [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                  {post.caption}
                </p>
              )}
              {post.views != null && (
                <span className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-gold-hi">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  {formatCount(post.views)}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

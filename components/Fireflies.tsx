"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vy: number; ph: number; sp: number; sway: number; hue: number };

/** Luciérnagas doradas (como las lámparas del fondo) + parallax suave con el mouse. */
export default function Fireflies() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // sprite con brillo precalculado (más barato que shadowBlur)
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d")!;
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,230,160,1)");
    g.addColorStop(0.25, "rgba(255,194,61,0.65)");
    g.addColorStop(1, "rgba(255,106,26,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);

    let parts: P[] = [];
    const make = (initial: boolean): P => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 20,
      r: 5 + Math.random() * 11,
      vy: 0.12 + Math.random() * 0.4,
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.4,
      sway: 10 + Math.random() * 30,
      hue: Math.random(),
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 640 ? 22 : 40;
      parts = Array.from({ length: n }, () => make(true));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        p.y -= p.vy;
        if (p.y < -20) Object.assign(p, make(false));
        const x = p.x + Math.sin(t / 1000 * p.sp + p.ph) * p.sway;
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t / 700 * p.sp + p.ph));
        ctx.globalAlpha = a * 0.85;
        ctx.drawImage(sprite, x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const root = document.documentElement.style;
      root.setProperty("--px", String((e.clientX / window.innerWidth - 0.5) * 2));
      root.setProperty("--py", String((e.clientY / window.innerHeight - 0.5) * 2));
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      raf = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden />;
}

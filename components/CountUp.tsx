"use client";

import { useEffect, useRef, useState } from "react";

/** Anima valores tipo "7.7K" o "317" al entrar en pantalla. Si no es numérico ("Cartagena") se muestra tal cual. */
export default function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = m ? parseFloat(m[1]) : null;
  const decimals = m && m[1].includes(".") ? m[1].split(".")[1].length : 0;
  const suffix = m ? m[2] : "";
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(target ?? 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1600;
        setN(0);
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / dur);
          setN(target * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  if (target === null) return <span>{value}</span>;
  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

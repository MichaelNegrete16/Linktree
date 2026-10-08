"use client";

import type { PointerEvent, ReactNode } from "react";

/** Contenedor con "spotlight": un halo dorado que sigue al cursor sobre la tarjeta. */
export default function Spot({
  href,
  className = "",
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerMove={onMove}
        className={`spot ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <div onPointerMove={onMove} className={`spot ${className}`}>
      {children}
    </div>
  );
}

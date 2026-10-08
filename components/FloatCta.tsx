"use client";

import { useEffect, useState } from "react";

/** Botón flotante inferior: aparece al hacer scroll y se esconde cuando el CTA principal está a la vista. */
export default function FloatCta({ href, label, icon }: { href: string; label: string; icon: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const main = document.getElementById("cta-main");
    let pastHero = false;
    let mainVisible = false;
    const update = () => setOn(pastHero && !mainVisible);
    const onScroll = () => {
      pastHero = window.scrollY > 520;
      update();
    };
    const io = new IntersectionObserver(([e]) => {
      mainVisible = e.isIntersecting;
      update();
    });
    if (main) io.observe(main);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`floatcta ${on ? "on" : ""}`} aria-hidden={!on}>
      <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={on ? 0 : -1} className="btn-cta !py-4">
        <span className="material-symbols-outlined">{icon}</span>
        {label}
      </a>
    </div>
  );
}

import Fireflies from "./Fireflies";

// Fondo fijo: atardecer tropical vivo (Ken Burns + parallax + luz del sol + luciérnagas).
export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="bg-sunset" />
      <div className="sun-glow" />
      {/* velo vertical para legibilidad: más oscuro arriba (nav) y abajo (CTA) */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/40 to-background/90" />
      {/* viñeta para enfocar el contenido */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,transparent_0%,rgba(10,10,10,0.5)_100%)]" />
      <Fireflies />
    </div>
  );
}

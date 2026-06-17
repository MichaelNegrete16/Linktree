// Fondo fijo: atardecer tropical a pantalla completa + velo para legibilidad.
export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* imagen */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat" />
      {/* velo vertical: un poco más oscuro arriba (nav) y abajo (footer/CTA),
          claro en el centro para que se vea el paisaje */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/35 to-background/85" />
      {/* viñeta suave para enfocar la columna de contenido */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,transparent_0%,rgba(10,10,10,0.45)_100%)]" />
    </div>
  );
}

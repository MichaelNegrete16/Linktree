// Claqueta de cine con la tapa levantada (Material Symbols solo trae la cerrada).
export default function ClapperOpen({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* cuerpo */}
      <rect x="3" y="11" width="18" height="10" rx="1.5" />
      <path d="M3 15h18" />
      {/* tapa levantada */}
      <g transform="rotate(-16 3.5 10)">
        <rect x="3.5" y="6.2" width="17.5" height="3.8" rx="0.9" />
        <path d="M8 6.2 6.6 10M12.5 6.2 11.1 10M17 6.2 15.6 10" />
      </g>
    </svg>
  );
}

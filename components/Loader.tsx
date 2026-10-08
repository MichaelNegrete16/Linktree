import { profileConfig } from "@/lib/config";

// CSS puro: un sol que sale del horizonte. Se autodestruye por animación (no depende de JS).
export default function Loader() {
  return (
    <div className="loader" aria-hidden>
      <div className="loader__scene">
        <div className="loader__sun" />
        <div className="loader__horizon" />
        <p className="loader__word">{profileConfig.brandLabel}</p>
      </div>
    </div>
  );
}

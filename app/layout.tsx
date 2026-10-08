import type { Metadata, Viewport } from "next";
import { Outfit, Manrope, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { profileConfig } from "@/lib/config";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profileConfig.brandLabel} · Bio`,
  description: `Todos los enlaces de ${profileConfig.brandLabel} en un solo lugar.`,
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

// Oculta los reveal solo si hay JS; red de seguridad si nada se reveló.
const bootScript = `document.documentElement.classList.add("js");setTimeout(function(){if(!document.querySelector(".is-visible"))document.documentElement.classList.add("reveal-all")},4500);`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${outfit.variable} ${manrope.variable} ${jetbrains.variable} ${instrument.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="grain min-h-full flex flex-col text-on-surface font-body overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawerLazy } from "@/components/cart/CartDrawerLazy";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/ui/Toast";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { RevealInit } from "@/components/ui/RevealInit";
import { categories } from "@/lib/catalog";

// nom et gros titres : grotesque condensée très grasse
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
// accroches : serif italique
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap", preload: false });
// étiquettes, numéros, prix
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap", preload: false });
// texte courant
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Palais du Style · Mieux. Moins cher. Plus vite.", template: "%s · Palais du Style" },
  description: "Sneakers, sacs, vêtements et accessoires. Mieux, moins cher, plus vite : livré en 4 jours, on te répond 24h/24.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e0e0c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${anton.variable} ${instrument.variable} ${mono.variable} ${archivo.variable}`}>
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper">
          Aller au contenu
        </a>
        <CartProvider>
          <SmoothScroll />
          <RevealInit />
          <Header categories={categories} />
          <main id="contenu" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <CartDrawerLazy />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}

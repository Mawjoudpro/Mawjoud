import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/ui/Toast";
import { MotionProvider } from "@/components/ui/MotionProvider";

const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-bodoni", display: "swap" });
// accent du titre du hero (« FRAPPE »), en italique
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Palais du Style · C'est la frappe !", template: "%s · Palais du Style" },
  description: "Paires de chaussures, sacs, sapes et accessoires : une qualité jamais vue, à prix cassés. Livré en 4 jours.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${bodoni.variable} ${archivo.variable} ${instrument.variable}`}>
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper">
          Aller au contenu
        </a>
        <MotionProvider>
          <CartProvider>
            <Header />
            <main id="contenu" className="min-h-[60vh]">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <Toast />
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

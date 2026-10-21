import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { site } from "@/lib/site";
import "./globals.css";

const transrobotics = localFont({
  src: "../public/fonts/TransRobotics-Italic.ttf",
  variable: "--font-transrobotics",
  display: "swap",
});

const codec = localFont({
  src: "../public/fonts/CodecPro-Regular.ttf",
  variable: "--font-codec",
  display: "swap",
});

const lust = localFont({
  src: "../public/fonts/Lust-Regular.ttf",
  variable: "--font-lust-local",
  display: "swap",
});

const sixcaps = localFont({
  src: "../public/fonts/SixCaps-Regular.ttf",
  variable: "--font-sixcaps",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RUA · Rua Unindo Amigos",
    template: "%s · RUA",
  },
  description: site.descricao,
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon-512.png", type: "image/png", sizes: "512x512" }],
    apple: "/apple-touch-icon.png",
  },
  // Imagem de compartilhamento (1200 × 630) ainda não existe.
  openGraph: {
    title: "RUA · Rua Unindo Amigos",
    description: site.descricao,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${transrobotics.variable} ${codec.variable} ${lust.variable} ${sixcaps.variable}`}>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-verde focus:p-3 focus:text-preto">
          Pular para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo">{children}</main>
        <Rodape />
      </body>
    </html>
  );
}

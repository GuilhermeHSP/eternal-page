import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "EternalPage · Páginas de homenagem para presentear",
    template: "%s | EternalPage",
  },
  description: "Crie uma página de homenagem para quem você ama, com fotos, música, mensagens e linha do tempo, e envie o link de presente. Perfeito para o seu amor, namorados e bodas, e também Dia das Mães, Dia dos Pais, aniversários e mais.",
  keywords: ["página de homenagem", "presente personalizado", "presente para namorado", "presente para namorada", "dia dos namorados", "homenagem dia das mães", "homenagem dia dos pais", "bodas", "aniversário", "presente digital"],
  authors: [{ name: "EternalPage" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "EternalPage · Páginas de homenagem para presentear",
    description: "Crie uma página de homenagem para quem você ama em poucos minutos.",
    type: "website",
    locale: "pt_BR",
    siteName: "EternalPage",
  },
  twitter: {
    card: "summary_large_image",
    title: "EternalPage · Páginas de homenagem para presentear",
    description: "Crie uma página de homenagem para quem você ama em poucos minutos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Great+Vibes&family=Josefin+Sans:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EternalPage - Create Beautiful Tribute Pages",
    template: "%s | EternalPage",
  },
  description: "Create beautiful, personalized tribute pages for your loved ones. Add photos, music, messages, and share with a unique link. Perfect for birthdays, anniversaries, Mother's Day, Father's Day, and more.",
  keywords: ["tribute page", "memorial", "birthday tribute", "anniversary", "personalized gift", "digital tribute", "memory page"],
  authors: [{ name: "EternalPage" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "EternalPage - Create Beautiful Tribute Pages",
    description: "Create beautiful, personalized tribute pages for your loved ones in minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EternalPage - Create Beautiful Tribute Pages",
    description: "Create beautiful, personalized tribute pages for your loved ones in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
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

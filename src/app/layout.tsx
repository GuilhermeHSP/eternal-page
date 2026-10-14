import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "EternalPage · Uma página de homenagem para presentear",
    template: "%s | EternalPage",
  },
  description: "Junte fotos, uma mensagem e a história de vocês numa página só e envie o link de presente. Você monta de graça e paga uma vez para publicar.",
  keywords: ["página de homenagem", "presente personalizado", "homenagem dia das mães", "homenagem dia dos pais", "bodas", "aniversário", "presente digital"],
  authors: [{ name: "EternalPage" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "EternalPage · Uma página de homenagem para presentear",
    description: "Junte fotos, uma mensagem e a história de vocês numa página só e envie o link de presente.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "EternalPage · Uma página de homenagem para presentear",
    description: "Junte fotos, uma mensagem e a história de vocês numa página só e envie o link de presente.",
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
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

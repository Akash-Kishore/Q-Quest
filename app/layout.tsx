import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/next';
import ScrollReset from "@/components/ScrollReset";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Q-QUEST",
  title: "Q-QUEST",
  description: "An interactive quantum computing learning environment and browser-based circuit simulator.",
  authors: [{ name: "Akash Kishore", url: "https://github.com/Akash-Kishore" }],
  creator: "Akash Kishore",
  publisher: "Akash Kishore",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,900&f[]=satoshi@400,700&display=swap" rel="stylesheet"/>
        {/* Material Symbols and the design-specific font families are intentionally loaded globally. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;700&family=Epilogue:wght@900&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <ScrollReset />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

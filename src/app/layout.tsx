import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeBot — Your Dev Bot",
  description: "CodeBot — Build your AI-powered mech, battle in turn-based combat, and evolve from Frame to Legend. Powered by Xiaomi MiMo V2.5 Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${pressStart.variable} ${jetbrains.variable}`}>
      <body className="min-h-full flex flex-col" style={{ background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-jetbrains), monospace" }}>
        {children}
      </body>
    </html>
  );
}

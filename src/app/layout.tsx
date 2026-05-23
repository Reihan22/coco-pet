import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeBot — Your Dev Bot",
  description: "A virtual bot that grows with your GitHub activity. Track commits, complete AI challenges, and watch your bot evolve!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'JetBrains Mono', monospace" }}>
        {children}
      </body>
    </html>
  );
}

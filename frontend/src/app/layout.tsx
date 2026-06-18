import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Network | Built for Developers",
  description: "A premium network for developer-first startups, driven by code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#050505] text-[#ededed]">
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="font-outfit font-bold text-xl tracking-tight">
              <span className="text-gradient">{"{"} Startup</span> Network {"}"}
            </h1>
            <nav className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
              Explore
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}

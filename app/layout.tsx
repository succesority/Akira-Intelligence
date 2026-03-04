import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Image from "next/image";
import { PROJECT_NAME, PROJECT_TAGLINE } from "@/lib/constants";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${PROJECT_NAME}`,
    default: `${PROJECT_NAME} - ${PROJECT_TAGLINE}`,
  },
  description: "Advanced Neural Architectural Synthesis and Autonomous Design Intelligence.",
  keywords: ["Akira Intelligence", "AI Architecture", "Autonomous Design", "Neural Synthesis", "Virtual City Builder"],
  authors: [{ name: "Akira Team" }],
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: PROJECT_NAME,
    description: PROJECT_TAGLINE,
    type: "website",
    siteName: PROJECT_NAME,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased selection:bg-primary/20 bg-background text-foreground transition-colors duration-300">
        <Providers>
          {children}

          <div className="fixed top-6 right-6 z-[60] flex items-center gap-3">
            <a
              href="https://x.com/AkiraIntel"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <Image
                src="/x-logo.svg"
                alt="X (Twitter)"
                width={18}
                height={18}
                className="brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </a>
            <a
              href="https://github.com/Akira-Intelligence"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <Image
                src="/github-logo.svg"
                alt="GitHub"
                width={20}
                height={20}
                className="brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </a>
          </div>

          <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 bg-black/40 backdrop-blur-2xl px-5 py-2.5 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Neural Link:</span>
              <span className="text-xs font-mono font-medium text-white/80">SYNTH_04.2</span>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

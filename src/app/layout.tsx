import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ToolFocusProvider } from "./components/system/ToolFocusProvider";
import AscentSky from "./components/system/AscentSky";
import Altimeter from "./components/system/Altimeter";
import SystemOverlays from "./components/system/SystemOverlays";
import IntroSequence from "./components/system/IntroSequence";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// TODO(jake): confirm the canonical domain. Set NEXT_PUBLIC_SITE_URL at build
// time to override; share cards resolve their image URLs against this.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dev-jk.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Jake Neverida | Software Engineer & QA Analyst",
  description: "Jake Neverida's portfolio. Software engineer shipping his own Next.js and React products, and a QA Analyst at Vertere Global Solutions Inc. by day.",
  keywords: [
    "Jake Neverida",
    "neverida-jk",
    "Software Engineer",
    "Web Developer",
    "QA Analyst",
    "Quality Assurance Analyst",
    "Vertere Global Solutions",
    "Next.js",
    "React",
    "TypeScript",
    "Portfolio"
  ],
  authors: [{ name: "Jake Neverida", url: "https://github.com/neverida-jk" }],
  creator: "Jake Neverida",
  openGraph: {
    title: "Jake Neverida | Software Engineer & Web Developer",
    description: "Software engineer shipping his own Next.js and React products, and a QA Analyst at Vertere Global Solutions Inc. by day.",
    url: SITE_URL,
    siteName: "Jake Neverida Portfolio",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the inline script below adds the `js` class to
    // <html> before hydration, which is intentional.
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Runs before first paint. Scroll-reveal hiding is scoped to `.js`,
            so with JavaScript unavailable every section is simply visible. */}
        {/* Before first paint: mark JS, and decide whether the opening plays
            (first visit per session, motion allowed). */}
        <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('jake.intro.seen')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro-seen')}catch(e){d.classList.add('intro-seen')}" }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans antialiased bg-canvas text-ink min-h-screen selection:bg-alpine/25 selection:text-ink`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-summit focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-void"
        >
          Skip to content
        </a>
        <AscentSky />
        <ToolFocusProvider>{children}</ToolFocusProvider>
        <Altimeter />
        <SystemOverlays />
        <IntroSequence />
      </body>
    </html>
  );
}

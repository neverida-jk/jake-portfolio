import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ToolFocusProvider } from "./components/system/ToolFocusProvider";
import AscentSky from "./components/system/AscentSky";
import Altimeter from "./components/system/Altimeter";
import SystemOverlays from "./components/system/SystemOverlays";
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

export const metadata: Metadata = {
  title: "Jake Neverida | Quality Assurance Analyst & Software Engineer",
  description: "Portfolio of Jake Neverida — Quality Assurance Analyst at Vertere Global Solutions Inc. & Software Engineer. Specializing in software quality testing, modern web applications, Next.js, React, TypeScript, and full-stack systems.",
  keywords: [
    "Jake Neverida",
    "neverida-jk",
    "Quality Assurance Analyst",
    "QA Analyst",
    "Software Engineer",
    "Web Developer",
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
    description: "High-performance web applications, modern full-stack engineering, and computer science foundations.",
    url: "https://github.com/neverida-jk",
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
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans antialiased bg-base text-ink min-h-screen selection:bg-alpine/25 selection:text-ink`}
      >
        <AscentSky />
        <ToolFocusProvider>{children}</ToolFocusProvider>
        <Altimeter />
        <SystemOverlays />
      </body>
    </html>
  );
}

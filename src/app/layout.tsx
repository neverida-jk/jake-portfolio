import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const viewport: Viewport = {
  themeColor: "#050505",
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} font-sans antialiased bg-[#050505] text-[#ededed] min-h-screen selection:bg-zinc-700 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}

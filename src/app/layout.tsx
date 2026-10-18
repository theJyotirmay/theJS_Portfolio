import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./home-hero.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jyotirmay - Full Stack Developer",
  description: "Portfolio website of Jyotirmay showcasing projects, skills, and contact information.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased lenis lenis-smooth`}
    >
      <body className="min-h-full flex flex-col font-montrealMono">
        <svg style={{ display: 'none' }}>
          <filter id="grainy">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}

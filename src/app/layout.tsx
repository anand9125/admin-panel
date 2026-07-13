import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trenchers — Trade the trenches, faster",
  description:
    "The fastest way to trade Solana. A real-time token feed, AI trading agents, and pro-grade one-click execution — all in one terminal.",
  openGraph: {
    title: "Trenchers — Trade the trenches, faster",
    description: "Real-time token feed, AI trading agents, and one-click execution for Solana.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

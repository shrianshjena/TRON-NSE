import type { Metadata } from "next";
import { Inter, Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TRON NSE | AI-Powered Intelligence for Indian Equities",
  description:
    "Search any NSE-listed stock and view comprehensive financial data with AI-powered investment scoring. Real-time price data, financials, earnings, and historical analysis.",
  keywords: [
    "NSE",
    "Indian stocks",
    "stock analysis",
    "AI investing",
    "equity research",
    "TRON NSE",
  ],
  authors: [{ name: "Shriansh Jena" }],
  openGraph: {
    title: "TRON NSE | AI-Powered Intelligence for Indian Equities",
    description:
      "Search any NSE-listed stock and view comprehensive financial data with AI-powered investment scoring.",
    type: "website",
    locale: "en_IN",
    siteName: "TRON NSE",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${shareTechMono.variable}`}
    >
      <body className="font-body antialiased min-h-screen bg-tron-bg-primary text-tron-text-primary">
        {children}
      </body>
    </html>
  );
}

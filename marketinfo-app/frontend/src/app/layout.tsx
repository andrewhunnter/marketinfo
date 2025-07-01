import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarketInfo | Real-time Financial Intelligence Platform",
  description: "Advanced financial dashboard with real-time crypto data, economic indicators, and market analytics. Make informed decisions with cutting-edge visualization and AI-powered insights.",
  keywords: "cryptocurrency, market data, financial dashboard, real-time analytics, economic indicators, trading platform",
  authors: [{ name: "MarketInfo Team" }],
  creator: "MarketInfo",
  publisher: "MarketInfo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://marketinfo.app'),
  openGraph: {
    title: "MarketInfo | Real-time Financial Intelligence Platform",
    description: "Advanced financial dashboard with real-time crypto data and market analytics",
    url: "https://marketinfo.app",
    siteName: "MarketInfo",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MarketInfo Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketInfo | Real-time Financial Intelligence Platform",
    description: "Advanced financial dashboard with real-time crypto data and market analytics",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white custom-scrollbar`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const getMetadataBase = (): URL => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url && url.trim() !== "") {
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return new URL(url);
      }
      return new URL(`https://${url}`);
    } catch {
      // Ignore error and fallback
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("https://duaa-academy.vercel.app");
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Duaa Academy | Mirpur Mathelo",
  description: "Your Future. Our Commitment. Your Success. 20 Years of Educational Excellence in Mirpur Mathelo.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Duaa Academy | Mirpur Mathelo",
    description: "Your Future. Our Commitment. Your Success. 20 Years of Educational Excellence in Mirpur Mathelo.",
    url: "https://duaa-academy.vercel.app",
    siteName: "Duaa Academy",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Duaa Academy Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duaa Academy | Mirpur Mathelo",
    description: "Your Future. Our Commitment. Your Success. 20 Years of Educational Excellence in Mirpur Mathelo.",
    images: ["/logo.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

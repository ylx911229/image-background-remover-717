import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Free Image Background Remover – Clearcut",
    template: "%s – Clearcut",
  },
  description:
    "Remove image backgrounds online in seconds. No sign-up, no image storage—just a clean transparent PNG ready to download.",
  keywords: [
    "image background remover",
    "remove background from image",
    "transparent background maker",
    "free background remover",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Clearcut",
    title: "Remove backgrounds. Keep what matters.",
    description:
      "A fast, privacy-conscious image background remover. No sign-up required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove backgrounds. Keep what matters.",
    description:
      "A fast, privacy-conscious image background remover. No sign-up required.",
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
    <html lang="en" className="scroll-smooth">
      <body>
        {children}
        {process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
            })}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}

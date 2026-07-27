import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { productionUrl } from "@/lib/paths";

const socialImage = new URL("og.png", productionUrl).toString();
const themeScript = `
  try {
    const saved = localStorage.getItem("spectra-leaf-theme");
    const theme = saved === "light" || saved === "dark"
      ? saved
      : (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: "Spectra Leaf | Intelligent Tea Fermentation System",
  description: "An AWS-powered Industrial IoT platform for real-time tea-fermentation monitoring, structured data collection and future AI-based sweet-spot detection.",
  keywords: [
    "tea fermentation",
    "Industrial IoT",
    "IIoT",
    "ESP32",
    "AWS IoT Core",
    "machine learning",
    "tea manufacturing",
    "fermentation monitoring",
    "smart factory",
    "serverless architecture",
    "DynamoDB",
    "Next.js",
  ],
  alternates: { canonical: productionUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Spectra Leaf | Intelligent Tea Fermentation System",
    description: "Organic fermentation meets precision digital intelligence.",
    url: productionUrl,
    siteName: "Spectra Leaf",
    type: "website",
    images: [{ url: socialImage, width: 1200, height: 630, alt: "Spectra Leaf fermentation intelligence system" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectra Leaf | Intelligent Tea Fermentation System",
    description: "AWS-powered Industrial IoT for measurable tea fermentation.",
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf7" },
    { media: "(prefers-color-scheme: dark)", color: "#07110d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

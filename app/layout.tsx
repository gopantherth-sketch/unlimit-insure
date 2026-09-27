import type { Metadata, Viewport } from "next";
import { Allura, IBM_Plex_Sans_Thai, Prompt } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

// Heavy rounded-geometric Thai display face for headings (design/mockup-spec.md, typography cues).
const display = Prompt({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

// Handwritten English script, only for the 3–4 decorative accents.
const script = Allura({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-script",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Unlimit Insure — ประกันรถที่เข้าใจคุณ มากกว่าแค่ราคา",
    template: "%s | Unlimit Insure",
  },
  description: "เปรียบเทียบประกันรถยนต์ให้เข้าใจก่อนเลือก ดูความคุ้มครองได้โดยไม่ต้องให้เบอร์โทร แล้วขอราคาจริงทาง LINE",
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32" }, { url: "/icon-192.png", sizes: "192x192" }],
    apple: "/apple-touch-icon.png",
  },
  // Link previews on Facebook, LINE and X. No page sets its own openGraph, so this applies site-wide.
  openGraph: {
    type: "website",
    siteName: "Unlimit Insure",
    locale: "th_TH",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Unlimit Insure ประกันรถที่เข้าใจคุณ มากกว่าแค่ราคา" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#1016D1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sans.variable} ${display.variable} ${script.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

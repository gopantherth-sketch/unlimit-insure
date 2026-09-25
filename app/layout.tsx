import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Unlimit Insure — ประกันรถที่เข้าใจคุณ มากกว่าแค่ราคา",
    template: "%s | Unlimit Insure",
  },
  description: "เปรียบเทียบประกันรถยนต์ให้เข้าใจก่อนเลือก ดูราคาและความคุ้มครองได้โดยยังไม่ต้องให้เบอร์โทร",
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32" }, { url: "/icon-192.png", sizes: "192x192" }],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1016D1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

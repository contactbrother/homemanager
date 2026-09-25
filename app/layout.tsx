import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted, so builds never depend on reaching Google Fonts. SIL OFL, see fonts/OFL.txt.
const figtree = localFont({
  src: "./fonts/figtree-latin-wght-normal.woff2",
  variable: "--font-figtree",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Dar", template: "%s | Dar" },
  description: "Everything about your home, in one place.",
  applicationName: "Dar",
  // The portal is private. The public website will set its own indexing rules.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Dar", statusBarStyle: "default" },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#F1F3F0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

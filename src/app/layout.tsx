import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { LiquidGlassFilter } from "@/components/ui/liquid-glass-filter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Paragraph Markets",
  description: "Trade popular coins on Paragraph",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} antialiased`}
      >
        <LiquidGlassFilter />
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              borderRadius: "2rem",
            },
          }}
        />
      </body>
    </html>
  );
}

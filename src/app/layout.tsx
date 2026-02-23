import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriConnect - Direct Farm to Buyer Marketplace",
  description:
    "Connect directly with farmers. Buy fresh agricultural products without any broker involvement.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        <Providers>
          <Toaster position="top-right" />
          <Navbar />
          <main className="min-h-[calc(100vh-64px)] page-enter">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

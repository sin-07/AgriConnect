import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AgriConnect - Direct Farm to Buyer Marketplace",
  description:
    "Connect directly with farmers. Buy fresh agricultural products without any broker involvement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <Toaster position="top-right" />
          <Navbar />
          <main className="min-h-[calc(100vh-64px)] page-enter">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

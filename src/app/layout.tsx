import type { Metadata } from "next";
import "./globals.css";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `${config.appName} — League Prediction Markets`,
  description: "Private play-money prediction markets for a recreational sports league."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-900 text-gray-100 antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaaya Signals",
  description:
    "Track companies over time and surface only meaningful changes, why they matter, and what to do next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <div className="app-frame">
          <SiteHeader />
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  );
}

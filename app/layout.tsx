// crav-dashboard-app/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../src/index.css";
import HeightReporter from "./HeightReporter";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "CRAV Unified Dashboard",
  description: "Unified, enterprise-grade control center for all CRAV applications.",
  applicationName: "CRAV Dashboard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      {/* Minimal body: no internal header/footer so the website chrome stays authoritative */}
      <body className={`${inter.className} bg-[#F7F9FC] text-slate-800 h-full`}>
        {children}
        {/* Ensures the parent page resizes the iframe to our exact content height */}
        <HeightReporter />
      </body>
    </html>
  );
}

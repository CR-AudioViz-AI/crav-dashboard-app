// crav-dashboard-app/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  title: {
    default: "CRAV Dashboard",
    template: "%s · CRAV Dashboard",
  },
  description: "Unified, enterprise-grade control center for all CRAV applications.",
  applicationName: "CRAV Dashboard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#0B1A2A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-[#F7F9FC] text-slate-800 h-full`}>
        {/* Sticky enterprise header */}
        <header className="site-header sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="container mx-auto max-w-[1200px] px-4 h-16 flex items-center justify-between">
            {/* Brand */}
            <a href="/" className="flex items-center gap-3 group">
              <img
                src="/brand/logo.png"
                alt="CRAudioVizAI"
                className="h-8 w-auto"
              />
              <span className="font-semibold tracking-tight text-slate-900 group-hover:text-blue-700">
                CRAV Dashboard
              </span>
            </a>

            {/* Primary nav (shell-level quick links) */}
            <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
              <a href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
                Overview
              </a>
              <a href="/apps" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
                Apps
              </a>
              <a href="/credits" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
                Credits
              </a>
              <a href="/billing" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
                Billing
              </a>
              <a href="/assets" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
                Assets
              </a>
              <a href="/settings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
                Settings
              </a>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main id="content" className="page">
          <div className="container mx-auto max-w-[1200px] px-4 py-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="site-footer border-t border-slate-200 bg-white">
          <div className="container mx-auto max-w-[1200px] px-4 py-6 text-sm text-slate-600 flex items-center justify-between">
            <p>© {new Date().getFullYear()} CR AudioViz AI. All rights reserved.</p>
            <nav aria-label="Legal" className="flex items-center gap-4">
              <a href="/legal/privacy" className="hover:text-slate-900">Privacy</a>
              <a href="/legal/terms" className="hover:text-slate-900">Terms</a>
              <a href="/legal/security" className="hover:text-slate-900">Security</a>
              <a href="/legal/disclaimer" className="hover:text-slate-900">Disclaimer</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

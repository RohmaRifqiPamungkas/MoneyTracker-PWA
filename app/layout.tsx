import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SwRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyTracker — Personal Finance Dashboard",
  description: "Kelola keuangan pribadi Anda dengan mudah dan cerdas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyTracker",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { PinLockProvider } from "@/components/providers/pin-lock-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <SwRegister />
        <PinLockProvider>
          {children}
        </PinLockProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/geist";
import "@fontsource-variable/plus-jakarta-sans";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "myDoc - Build a CV. Write anything else.",
  description:
    "A CV builder and document editor in one workspace. Upload an old resume, tailor it to a job, or write a project brief, report, or meeting notes.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "myDoc",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
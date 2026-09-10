import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "@fontsource-variable/geist";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "myDoc — Format your CV without the frustration",
  description:
    "Upload your old resume and let myDoc map your history into a clean, professional layout instantly.",
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
      </body>
    </html>
  );
}
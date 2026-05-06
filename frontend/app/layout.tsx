import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers";

const outfit = Outfit({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AlalAI – Barangay Report System",
  description: "File and track barangay complaints and concerns online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.maptiler.com" />
        <link rel="dns-prefetch" href="https://api.maptiler.com" />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

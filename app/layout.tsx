import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";
import { Suspense } from "react";
import Spinner from "./loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "KoloSquad",
  description:
    "KoloSquad – a savings circle for friends. Create or join squads, contribute together through Paystack, unlock badges, and track progress in real time.",
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="kolosquad-theme">
          <Suspense fallback={<Spinner />}> 
          {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

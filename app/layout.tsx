import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";
import { Suspense } from "react";
import Spinner from "./loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ⚡ This fixes the theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('kolosquad-theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const active = theme === 'dark' || (!theme && prefersDark) ? 'dark' : 'light';
                  document.documentElement.classList.add(active);
                  document.documentElement.setAttribute('data-theme', active);
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${montserrat.className} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="kolosquad-theme"
          >
          <Toaster />
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}






// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import { Montserrat } from "next/font/google";
// import { ThemeProvider } from "@/components/providers/ThemeProvider";
// import "./globals.css";
// import { Suspense } from "react";
// import Spinner from "./loading";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const montserrat = Montserrat({
//   variable: "--font-montserrat",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });


// export const metadata = {
//   title: "KoloSquad",
//   description:
//     "KoloSquad – a savings circle for friends. Create or join squads, contribute together through Paystack, unlock badges, and track progress in real time.",
//   icons: {
//     icon: "/favicon.ico",
//   },
// };


// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${montserrat.className} antialiased`}>
//         <ThemeProvider attribute="class" defaultTheme="system" storageKey="kolosquad-theme" enableSystem>
//           <Suspense fallback={<Spinner />}> 
//           {children}
//           </Suspense>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

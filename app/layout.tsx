import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const helvetica = localFont({
  src: "../public/Helvetica.ttf",
  variable: "--font-helvetica",
});
const bitcountFont = localFont({
  src: "../public/bitcount.ttf",
  variable: "--font-bitcountFont",
});

export const metadata: Metadata = {
  title: "K-Way CMS",
  description:
    "CMS web app for management team of K-Way team for K-Way mobile application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bitcountFont.variable} ${helvetica.variable}`}
    >
      <body>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Knewave } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const knewave = Knewave({
  weight: '400',
  display: 'swap',
})

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const metadata: Metadata = {
  title: "Inkdraw",
  description: "A collaborative whiteboard for your ideas. Free and open source.",
  openGraph: {
    title: 'Inkdraw',
    description: 'Start drawing instantly.',
    images: ['/og-image.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
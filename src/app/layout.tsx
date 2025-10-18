import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});


export const metadata: Metadata = {
  title: "WeldPak - JS & CSS Combiner & Minifier",
  description: "Combine and minify JavaScript and CSS files with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased`}
        style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}

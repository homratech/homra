import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Homra - Find. Book. Live Better.",
  description: "The global PropTech platform for rentals, PGs, and home buying.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F5F5F7] antialiased`}>
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tandem — Kerja tim, dalam bahasa Anda sendiri",
  description:
    "Tandem adalah platform kolaborasi yang menyesuaikan istilahnya sendiri untuk sekolah, perusahaan, komunitas, dan instansi mana pun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

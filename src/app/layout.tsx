import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThesisTrack",
  description: "Sistem manajemen tugas akhir FTMM Universitas Airlangga",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

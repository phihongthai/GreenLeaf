import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenLeaf English Academy",
  description: "Phần mềm trung tâm Anh ngữ GreenLeaf — AI Pronunciation, Homework, Reward System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#F7F4EC] text-gray-800">{children}</body>
    </html>
  );
}

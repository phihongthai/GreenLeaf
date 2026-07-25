import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["500", "600", "700", "800"],
});

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
      <body className={`${baloo.variable} antialiased text-gray-800`}>{children}</body>
    </html>
  );
}

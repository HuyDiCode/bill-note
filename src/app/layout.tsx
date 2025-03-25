import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import "@/i18n"; // Import i18n configuration

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bill Note - Ứng dụng quản lý chi tiêu",
  description:
    "Ứng dụng quản lý chi tiêu cá nhân và cộng tác với tính năng chia sẻ, đính kèm hóa đơn, và phân loại chi tiêu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

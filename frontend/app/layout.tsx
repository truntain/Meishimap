import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-brand-google",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body-google",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MESHIMAP — Tinh hoa ẩm thực Nhật Bản tại Việt Nam",
  description: "Nền tảng đặt chỗ và khám phá ẩm thực hàng đầu, kết nối tinh hoa ẩm thực Việt Nam và Nhật Bản.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} ${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

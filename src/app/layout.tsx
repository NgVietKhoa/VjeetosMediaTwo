import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Vjeetos Media - Rạp chiếu phim online về đêm",
  description: "Trải nghiệm rạp chiếu phim trực tuyến tại nhà với giao diện rạp chiếu phim đêm tuyệt đẹp, không quảng cáo phiền toái.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
  modal, // Supporting intercepting routes if needed later
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-bg-void text-text-primary font-body">
        <Navbar />
        <main className="flex-1 pt-16 flex flex-col relative z-10">
          {children}
        </main>
        {modal}
        <Footer />
      </body>
    </html>
  );
}

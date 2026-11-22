import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARU Stock - ระบบยืม-คืนอุปกรณ์ องค์การนักศึกษา มรภ.พระนครศรีอยุธยา",
  description: "ระบบบริการยืม-คืนอุปกรณ์และพัสดุ องค์การบริหาร องค์การนักศึกษา มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา (ARU Student Organization)",
  icons: {
    icon: "/aru-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-800 antialiased font-thai">
        {children}
      </body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "أصول | إدارة الأصول المؤسسية",
  description: "منصة عربية لإدارة الأصول وتتبع عهدتها وحالتها وموقعها.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

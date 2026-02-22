import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vant",
  description: "Life-changing commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

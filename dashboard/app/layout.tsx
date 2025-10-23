import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jetboost Alternative - Dashboard",
  description: "Manage your Webflow authentication and wishlist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

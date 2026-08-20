import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "REFUND  AND  CANCELLATION DEPARTMENT",
  description: "Secure customer information portal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-slate-900 antialiased">{children}</body>
    </html>
  );
}

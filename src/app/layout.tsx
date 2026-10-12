import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./admin.css";
import "./restaurant.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: env.APP_NAME,
    template: `%s | ${env.APP_NAME}`,
  },
  description: "A simple, mobile-first digital home for restaurants.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#078C99",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-KE">
      <body>{children}</body>
    </html>
  );
}

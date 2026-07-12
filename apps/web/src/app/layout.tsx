import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NederStart",
    template: "%s | NederStart"
  },
  description: "Dutch learning platform for Portuguese and English speakers living in the Netherlands.",
  applicationName: "NederStart",
  keywords: ["Dutch", "Nederlands", "Portuguese speakers", "English speakers", "language learning"],
  openGraph: {
    title: "NederStart",
    description: "Dutch learning platform for Portuguese and English speakers living in the Netherlands.",
    type: "website"
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

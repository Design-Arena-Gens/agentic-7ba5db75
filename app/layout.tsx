import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brian — Open Personal Intelligence",
  description:
    "An open-source Ubuntu-centric personal assistant that blends global intelligence with your own vision."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

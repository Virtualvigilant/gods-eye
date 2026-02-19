import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOD'S EYE // SURVEILLANCE INTERFACE",
  description: "Global Observation and Detection System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="scanline vignette bg-surveillance-deepest min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
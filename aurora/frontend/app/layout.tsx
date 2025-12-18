import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aurora Subsurface Intelligence",
  description: "Orbital subsurface intelligence & probabilistic discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

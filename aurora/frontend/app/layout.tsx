import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aurora Core - Institutional Discovery",
  description: "Phase 12 Subsurface Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}

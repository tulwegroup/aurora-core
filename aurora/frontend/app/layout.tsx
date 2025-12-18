import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aurora Core – Institutional Discovery",
  description: "Phase 12 Subsurface Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        {/* App Root */}
        <div id="aurora-root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

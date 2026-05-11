import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optee — Pisteur",
  description: "Plateforme de leads pour professionnels de la rénovation énergétique",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

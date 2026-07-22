import type { Metadata } from "next";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/600.css";
import { AuthProvider } from "@/lib/auth-context";
import { MockProvider } from "@/app/mock-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "artemis.agent — Your AI job hunting agent",
  description: "An AI agent that hunts jobs across 1,000+ companies, matches your skills, and delivers opportunities you'd miss. No browsing. No filtering. Just results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col">
        <MockProvider>
          <AuthProvider>{children}</AuthProvider>
        </MockProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextFullStep - AI Career Transition Platform",
  description: "Transform your career with AI-powered assessments and personalized roadmaps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="bg-muted/50 flex h-100vh flex-1 flex-col">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
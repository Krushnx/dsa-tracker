import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import "@/lib/auth/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DSA Tracker — Track Your Interview Preparation",
  description:
    "The simplest way to track your LeetCode progress, maintain solving streaks, and analyze your interview preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#0A0A0A] text-[#FAFAFA] antialiased font-[family-name:var(--font-inter)]">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#171717",
              border: "1px solid #262626",
              color: "#FAFAFA",
            },
          }}
        />
      </body>
    </html>
  );
}

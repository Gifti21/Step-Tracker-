import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StepTracker",
  description: "Track your daily steps and movement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

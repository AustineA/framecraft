import type { Metadata } from "next";
import { Funnel_Sans, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Framecraft — Screenshot Editor",
  description: "Design App Store screenshots that convert.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${funnelSans.variable} h-full antialiased`}
    >
      <body className="font-ui h-full overflow-hidden text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}

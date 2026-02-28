import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeAI — AI Resume Screener | Find Your Ideal Career Role",
  description:
    "Upload your resume and let AI analyze your skills, experience, and strengths to recommend the top roles you're best suited for — with confidence scores and a downloadable PDF report.",
  keywords: [
    "AI resume screener",
    "career prediction",
    "resume analyzer",
    "job role prediction",
    "AI career guidance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

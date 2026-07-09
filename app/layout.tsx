import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LIBRARY AI LAB | Mahidol University Library",
  description:
    "Futuristic academic AI workshop landing page for LIBRARY AI LAB. Explore sessions, speakers, and registration details.",
  keywords: [
    "Library AI Lab",
    "Mahidol University",
    "AI Workshop",
    "Digital Literacy",
    "NotebookLM",
    "Gemini",
    "Claude",
    "University Library",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

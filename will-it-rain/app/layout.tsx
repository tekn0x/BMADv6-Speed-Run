import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Will It Rain? | Simple 24-Hour Rain Forecast",
  description: "Get a simple yes or no answer about rain in your area for the next 24 hours",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Will It Rain?",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Will It Rain? | Simple 24-Hour Rain Forecast",
    description: "Get a simple yes or no answer about rain in your area for the next 24 hours",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

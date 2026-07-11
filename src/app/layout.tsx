import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
}); 

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Docs Innovara | Enterprise Document Management",
  description: "Secure, robust document and project management platform tailored for enterprise teams with GitHub-backed scalable storage and RBAC.",
  keywords: ["document management", "enterprise", "storage", "docs innovara", "secure file sharing", "project management"],
  authors: [{ name: "Innovara Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docs-innovara.app",
    title: "Docs Innovara | Enterprise Document Management",
    description: "Secure, robust document and project management platform tailored for enterprise teams.",
    siteName: "Docs Innovara",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Docs Innovara Preview",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Docs Innovara | Enterprise Document Management",
    description: "Secure, robust document and project management platform tailored for enterprise teams.",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

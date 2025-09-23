import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MusicProvider } from "@/lib/music-context"
import { MiniPlayer } from "@/components/music/mini-player"
import Script from 'next/script';
import { Chatbot } from "@/components/chat-bot/chatbot"

const inter = Inter({ subsets: ["latin"] })

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID;
export const metadata: Metadata = {
  title: "Duoheads - AI Study Assistant",
  description: "AI-powered productivity and learning assistant for students",
  icons: {
    icon: "/logo.png",
  },
  metadataBase: new URL("https://www.duoheads.com"),
  openGraph: {
    title: "Second Brain - AI Study Assistant",
    description: "AI-powered productivity and learning assistant for students",
    url: "https://www.duoheads.com",
    siteName: "Second Brain",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Second Brain Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Second Brain - AI Study Assistant",
    description: "AI-powered productivity and learning assistant for students",
    site: "@duoheads",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://www.duoheads.com",
  },
  keywords: [
    "AI study assistant",
    "productivity",
    "learning",
    "students",
    "Second Brain",
    "digital planner",
    "AI journal",
    "study tools",
    "note taking",
      "duoheads.com"
  ],
  authors: [{ name: "Second Brain Team", url: "https://www.duoheads.com" }],
  creator: "Second Brain Team",
  publisher: "Second Brain",
  applicationName: "Second Brain",
  category: "Education",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Second Brain Team" />
        <meta name="keywords" content="AI study assistant, productivity, learning, students, Second Brain, digital planner, AI journal, study tools, note taking, duoheads.com" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Second Brain - AI Study Assistant" />
        <meta property="og:description" content="AI-powered productivity and learning assistant for students" />
        <meta property="og:url" content="https://www.duoheads.com" />
        <meta property="og:site_name" content="Second Brain" />
        <meta property="og:image" content="https://www.duoheads.com/logo.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Second Brain - AI Study Assistant" />
        <meta property="twitter:description" content="AI-powered productivity and learning assistant for students" />
        <meta property="twitter:image" content="https://www.duoheads.com/logo.png" />
        <meta property="twitter:site" content="@duoheads" />
        <link rel="canonical" href="https://www.duoheads.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MusicProvider>
            {children}
            <MiniPlayer />
            <Toaster />
          </MusicProvider>
          <Chatbot />
        </ThemeProvider>

        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

      </body>
    </html>
  )
}

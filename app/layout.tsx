import type { Metadata } from "next"
import { Fraunces, Geist, Geist_Mono } from "next/font/google"
import { MobileNav, SiteHeader } from "@/components/site-chrome"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Plain Plate",
    template: "%s · Plain Plate",
  },
  description:
    "A 2,500 calorie high-protein, high-carb, low-fat cut you cook once a week. Eight whole foods, four plates, every day.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <div className="h-1 bg-protein" />
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:px-6 md:py-8 md:pb-16">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  )
}

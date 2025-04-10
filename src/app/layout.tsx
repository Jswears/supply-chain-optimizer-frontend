import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import ConfigureAmplify from "@/lib/configureAmplify"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "ChainOpt AI",
  description: "AI-powered supply chain optimization system for bakeries",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} h-full`}>
        <ConfigureAmplify />
        <SidebarProvider className="">
          {children}
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  )
}


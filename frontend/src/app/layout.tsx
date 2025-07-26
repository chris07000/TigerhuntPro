import React from 'react'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'TIGER HUNT PRO | Trading Signals Dashboard',
  description: 'Real-time trading signals dashboard with TradingView integration. Monitor live signals, track performance, and automate your trading workflow.',
  keywords: ['trading', 'signals', 'dashboard', 'tradingview', 'crypto', 'forex', 'tiger-hunt-pro', 'real-time'],
  authors: [{ name: 'Tiger Hunt Pro Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/tigerlogo.png', sizes: '32x32', type: 'image/png' },
      { url: '/tigerlogo.png', sizes: '16x16', type: 'image/png' },
      { url: '/tigerlogo.png', sizes: '192x192', type: 'image/png' },
      { url: '/tigerlogo.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/tigerlogo.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/tigerlogo.png',
        color: '#ffffff'
      }
    ]
  },
  openGraph: {
    title: 'Tiger Hunt Pro Trading Signals',
    description: 'Professional trading signals dashboard with real-time TradingView integration',
    type: 'website',
    images: ['/tigerlogo.png'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-background text-foreground antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 
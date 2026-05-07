import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ceres — AI Options Analysis Agent',
  description: 'Multi-agent options mispricing detection',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
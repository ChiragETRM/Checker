import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LearnETRM Self-Fit Quiz',
  description: 'Determine your eligibility for ETRM training programs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


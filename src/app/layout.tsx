import type { Metadata } from 'next'
import { DM_Sans, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'CodeXcape — Author OS',
  description: 'The operating system for authors. Write, shape, and publish with AI-powered creative tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sourceSerif.variable} font-sans`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

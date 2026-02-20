import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'EngMang — TCD Engineering with Management',
  description: 'Community platform for TCD Engineering with Management students',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} font-sans bg-zinc-950 text-white antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}

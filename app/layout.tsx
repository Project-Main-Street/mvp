// import './globals.css'

import "@radix-ui/themes/styles.css";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Inter } from 'next/font/google'
import { Theme } from "@radix-ui/themes";


export const metadata = {
  metadataBase: new URL('https://postgres-starter.vercel.app'),
  title: 'Postgres Demo',
  description:
    'A simple Next.js app with a Postgres database',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Theme>
              {children}
            </Theme>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}

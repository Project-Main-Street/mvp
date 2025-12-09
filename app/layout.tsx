// import './globals.css'

import "@radix-ui/themes/styles.css";
import "./view-transitions.css";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Inter } from 'next/font/google'
import { Theme } from "@radix-ui/themes";
import ViewTransitions from "@/lib/components/ViewTransitions";


export const metadata = {
  metadataBase: new URL('https://postgres-starter.vercel.app'),
  title: 'Main Street',
  description:
    'A community-driven platform to share and discuss ideas.',
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
    <html lang="en" style={{ viewTransitionName: 'none' }}>
      <body className={inter.variable}>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Theme>
              <ViewTransitions />
              {children}
            </Theme>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}

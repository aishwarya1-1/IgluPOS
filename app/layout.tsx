// app/layout.tsx

import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import ReactQueryProvider from './providers/ReactQueryProvider'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en">
      <body>
      <ReactQueryProvider>
          <div className="flex">
          
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </div>
          </ReactQueryProvider>
      </body>
    </html>
  )
}
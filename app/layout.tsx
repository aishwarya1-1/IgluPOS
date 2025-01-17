// app/layout.tsx

import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
     
          <div className="flex">
          
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </div>

      </body>
    </html>
  )
}
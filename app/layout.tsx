// app/layout.tsx
import { CartProvider } from '../context/CartContext'
import Sidebar from '../components/Sidebar'
import './globals.css'

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
          </div>

      </body>
    </html>
  )
}
// app/layout.tsx
import { CartProvider } from '../../context/CartContext'
import Sidebar from '../../components/Sidebar'
import '../globals.css'
import { SessionProvider } from "next-auth/react";

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
        <CartProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </CartProvider>
         </SessionProvider>

  )
}
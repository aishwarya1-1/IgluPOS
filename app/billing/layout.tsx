// app/layout.tsx
import { CartProvider } from '../../context/CartContext'
import Sidebar from '../../components/Sidebar'
import '../globals.css'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   
        <CartProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </CartProvider>

  )
}
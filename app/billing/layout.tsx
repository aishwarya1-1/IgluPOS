// app/layout.tsx
import { CartProvider } from '../../context/CartContext'
import Sidebar from '../../components/Sidebar'
import '../globals.css'

import { auth } from "@/auth"
import * as Avatar from '@radix-ui/react-avatar';
import { UserProvider } from '@/context/UserContext';

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  const userId =  session?.user?.id

  return (
    <UserProvider userId={userId}>
        <CartProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
            <div className="absolute top-4 right-4  text-blue p-2 ">
       <Avatar.Root className="bg-blackA1 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle">
      <Avatar.Image
        className="h-full w-full rounded-[inherit] object-cover"
        src="/iglu.png"
        alt="Colm Tuite"
      />
      <Avatar.Fallback
        className="text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
        delayMs={600}
      >
        CT
      </Avatar.Fallback>
      </Avatar.Root>
       <span> Welcome, {session?.user?.name}!</span>
      </div>
              {children}
            </main>
          </div>
        </CartProvider>
        </UserProvider>
     

  )
}
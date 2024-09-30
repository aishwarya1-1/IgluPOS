import IceCreamList from '../../components/IceCreamList'
import Cart from '../../components/Cart'
import Checkout from '../../components/Checkout'
import { useSession } from "next-auth/react";
import { auth } from "@/auth"
import * as Avatar from '@radix-ui/react-avatar';


export default async function Home() {
  const session = await auth();

  return (
   
    <main className="container mx-auto px-4 py-8 ">
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
            
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Iglu Cream Shop Billing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IceCreamList />
        <div>
          <Cart />
          <Checkout />
        </div>
      </div>
    </main>

  )
}
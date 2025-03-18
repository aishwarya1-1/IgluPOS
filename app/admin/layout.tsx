// app/layout.tsx

import Sidebar from '../../components/Sidebar'
import '../globals.css'
import { auth } from "@/auth"
import * as Avatar from '@radix-ui/react-avatar'
import { UserProvider } from '@/context/UserContext'
import Link from 'next/link'

export default async function Layout({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  const session = await auth()
  const userId = session?.user?.id
  const companyName=session?.user?.companyName
  
  return (
    <UserProvider userId={userId}
    companyName={companyName}>
      
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:fixed md:w-64">
          <Sidebar role="admin" companyName={companyName}/>
          </div>
          
          {/* Main Content */}
          <main className="flex-1 ml-0 md:ml-64 p-4">
            {/* Avatar and Welcome message */}
            <div className="absolute top-4 right-4 md:top-4 md:right-4 p-2 flex flex-col items-center group">
              <Link href="/admin/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar.Root className="bg-blackA1 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle">
                  <Avatar.Image
                    className="h-full w-full rounded-[inherit] object-cover"
                    src="/iglu.png"
                    alt="User Avatar"
                  />
                  <Avatar.Fallback
                    className="text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
                    delayMs={600}
                  >
                    {session?.user?.name?.[0]}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span>Welcome, {session?.user?.name}!</span>
              </Link>
              {/* Tooltip */}
              <span className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded max-w-[150px] text-center">
                Edit Details
              </span>
            </div>
            
            {children}
          </main>
        </div>

    </UserProvider>
  )
}

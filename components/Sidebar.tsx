// components/Sidebar.tsx
// 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/auth';
import NavLinks from './navLinks';
import { PowerIcon } from '@heroicons/react/16/solid';

const Sidebar = () => {
 

  return (
    <div className="bg-blue-500 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Iglu Ice Cream</h2>
      </div>
      <NavLinks />
     
      

        
        <form action={async () => {
            'use server';
            await signOut();
          }}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-blue-500 p-3 text-sm font-medium hover:bg-red-700 hover:text-white-600 md:flex-none md:justify-start md:p-2 md:px-3 ">
  <PowerIcon className="w-6" />
  <div className="hidden md:block">Sign Out</div>
</button>
        </form>
      </div>

  );
};

export default Sidebar;
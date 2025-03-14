
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
   UserIcon,
   ChartBarIcon,
   PlusCircleIcon,
   PercentBadgeIcon
  } from '@heroicons/react/24/outline';


  const navItems = [
    { name: 'Employee', path: '/admin',icon: UserIcon },
    { name: 'Dashboard', path: '/admin/dashboard',icon :ChartBarIcon },
    { name: 'Add Bulk Items', path: '/admin/upload' ,icon :PlusCircleIcon},
    { name: 'Coupons', path: '/admin/coupon' ,icon :PercentBadgeIcon},

  ];

export const  AdminNavLinks = () => {
   
    const pathname = usePathname();
  return (
    <div className="space-y-2 py-4">
            {navItems.map((link) => {
             const LinkIcon = link.icon;
                return (
                <Link
                    key={link.name}
                    href={link.path}

                    className={`'block py-2 px-4 flex items-center hover:bg-blue-700 transition gap-2 ' ${
                        pathname === link.path ? 'bg-blue-700' : ''
                    }`}
                >
                    <LinkIcon className="w-6" />
                    <p className=" md:block">{link.name}</p>
                </Link>
                  );
                })}
            </div>
            );
          }

export default AdminNavLinks
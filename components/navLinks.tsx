
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
    BanknotesIcon,
    // ChartBarIcon,
ArrowLeftCircleIcon,
    PlusCircleIcon,
    ClockIcon
  } from '@heroicons/react/24/outline';

  const navItems = [
    { name: 'Billing', path: '/billing',icon: BanknotesIcon },
    // { name: 'Dashboard', path: '/billing/dashboard',icon :ChartBarIcon },
    { name: 'Add Item', path: '/billing/add-item' ,icon :PlusCircleIcon},
    { name: 'KOT', path: '/billing/kot' ,icon :ArrowLeftCircleIcon},
    { name: 'Last Orders', path: '/billing/last-orders' ,icon :ClockIcon},
  ];

export const  NavLinks = () => {
   
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

export default NavLinks
// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Billing', path: '/billing' },
    { name: 'Dashboard', path: '/billing/dashboard' },
    { name: 'Add Item', path: '/billing/add-item' },
  ];

  return (
    <div className="bg-blue-500 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Iglu Ice Cream</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 py-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}
                    className={`block py-2 px-4 hover:bg-blue-700 ${
                      pathname === item.path ? 'bg-blue-700' : ''
                    }`}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4">
        <button
          onClick={() => {/* Add logout logic here */}}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 rounded transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
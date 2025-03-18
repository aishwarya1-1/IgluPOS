
import { PowerIcon } from '@heroicons/react/16/solid';
import { signOut } from '@/auth';
import NavLinks from './navLinks';
import AdminNavLinks from './AdminNavLinks';



const Sidebar = ({ role = 'employee',  companyName  }: { role?: string ;
  companyName?: string | null;
}) => {
 

  return (
    <div>
      {/* Toggle button for small screens */}
      <details className="md:hidden">
        <summary className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded">
          Menu
        </summary>

        {/* Sidebar for small screens */}
        <div className="fixed inset-y-0 left-0 w-64 bg-blue-500 text-white z-40">
          <div className="p-4">
            <h2 className="text-2xl font-bold">{companyName}</h2>
          </div>
          {role === 'admin' ? <AdminNavLinks /> : <NavLinks />}
          <form
            action={async () => {
              'use server';
              await signOut();
            }}>
            <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-blue-500 p-3 text-sm font-medium hover:bg-red-700 hover:text-white-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </form>
        </div>
      </details>

      {/* Sidebar for larger screens */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-blue-500 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">{companyName}</h2>
        </div>
        {role === 'admin' ? <AdminNavLinks /> : <NavLinks />}
        <form
          action={async () => {
            'use server';
            await signOut();
          }}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-blue-500 p-3 text-sm font-medium hover:bg-red-700 hover:text-white-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className=" md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;

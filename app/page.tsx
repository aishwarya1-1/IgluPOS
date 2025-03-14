'use client';

import Link from 'next/link';
import { authenticateStore, authenticateEmployee } from '@/app/lib/actions';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { useFormState } from 'react-dom';

export default function Login() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' or 'employee'
  
  const [storeErrorMessage, storeFormAction] = useFormState(
    authenticateStore,
    undefined,
  );
  
  const [employeeErrorMessage, employeeFormAction] = useFormState(
    authenticateEmployee,
    undefined,
  );

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-vertical-stripes bg-[length:100px_100px] opacity-60"></div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* Iglu Logo */}
        <div className="flex justify-center mb-6">
          {/* Logo component can be added here */}
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 font-medium text-center ${
              activeTab === 'store' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('store')}
          >
            Store Admin
          </button>
          <button
            className={`flex-1 py-2 font-medium text-center ${
              activeTab === 'employee' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('employee')}
          >
            Employee
          </button>
        </div>

        {/* Store Admin Login Form */}
        {activeTab === 'store' && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login as Store Admin</h2>
            <form action={storeFormAction} className="space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Role Input (hidden) */}
              <input type="hidden" name="role" value="store" />

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </button>
                <div className="mt-6">
                  <Link href="/register" className="text-blue-500 underline">
                    Register New Store
                  </Link>
                </div>

                <div
                  className="flex h-8 items-end space-x-1"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {storeErrorMessage && (
                    <>
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-500">{storeErrorMessage}</p>
                    </>
                  )}
                </div>
              </div>
            </form>
          </>
        )}

        {/* Employee Login Form */}
        {activeTab === 'employee' && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login as Employee</h2>
            <form action={employeeFormAction} className="space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="employee_username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="employee_username"
                  type="text"
                  name="username"
                  placeholder="Employee Username"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="employee_password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="employee_password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Role Input (hidden) */}
              <input type="hidden" name="role" value="employee" />

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </button>

                <div
                  className="flex h-8 items-end space-x-1"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {employeeErrorMessage && (
                    <>
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-500">{employeeErrorMessage}</p>
                    </>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
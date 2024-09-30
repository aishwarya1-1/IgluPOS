// pages/login.tsx
'use client';

import Link from 'next/link';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useFormState } from 'react-dom';

export default function Login() {
 
  const [errorMessage, formAction, isPending] = useFormState(
    authenticate,
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
      
        </div>

        {/* Login Form */}
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login to Iglu</h2>

        <form action={formAction} className="space-y-6">
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

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-disabled={isPending}
            >
              Login
            </button>
            <div className="mt-6">
      <Link href="/register"
         className="text-blue-500 underline ">Register New Login
      </Link>
      </div>

      <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
          </div>
        </form>
      </div>
    </div>
  );
}
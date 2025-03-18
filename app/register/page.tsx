'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { UserState, registerUser } from '../lib/actions';
import Link from 'next/link';

export default function RegistrationForm() {
  const initialState: UserState = { message: "", errors: {} };
  const [state, formAction] = useFormState(registerUser, initialState);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (state.message === "Successfully Registered") {
      setKey(prevKey => prevKey + 1);
    }
  }, [state]);

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">
      <div className="absolute inset-0 bg-vertical-stripes bg-[length:100px_100px] opacity-60"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {state.message && (
          <div
            className={`mb-4 p-2 rounded ${
              state.message === "Successfully Registered"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Register to Iglu</h2>
        <form key={key} action={formAction} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-describedby="email-error"
            />
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state.errors?.email && state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Set a Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-describedby="username-error"
            />
            <div id="username-error" aria-live="polite" aria-atomic="true">
              {state.errors?.username && state.errors.username.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Set Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-describedby="password-error"
            />
            <div id="password-error" aria-live="polite" aria-atomic="true">
              {state.errors?.password && state.errors.password.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Store Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-describedby="address-error"
            />
            <div id="address-error" aria-live="polite" aria-atomic="true">
              {state.errors?.address && state.errors.address.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>

          {/* GST Number Field */}
          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
              GST Number
            </label>
            <input
              type="text"
              id="gstNumber"
              name="gstNumber"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-describedby="gst-error"
            />
            <div id="gst-error" aria-live="polite" aria-atomic="true">
              {state.errors?.gstNumber && state.errors.gstNumber.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>
{/* compnay name */}
<div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
             Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              aria-describedby="company-error"
            />
            <div id="company-error" aria-live="polite" aria-atomic="true">
              {state.errors?.companyName && state.errors.companyName.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>

        <div className="mt-6">
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Go to Login Page
          </Link>
        </div>
      </div>
    </div>
  );
}
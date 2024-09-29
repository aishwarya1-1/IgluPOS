'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { UserState ,registerUser} from '../lib/actions';
import Link from 'next/link';




export default function RegistrationForm() {
    const initialState: UserState = { message: "", errors: {} };
    const [state, formAction] = useFormState(registerUser, initialState);
  
    const [key, setKey] = useState(0);

    useEffect(() => {
        console.log("State changed:", state);
        if (state.message==="Successfully Regsitered") {
          console.log("Resetting form...");
          setKey(prevKey => prevKey + 1);
        }
      }, [state]);


  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">
    
    <div className="absolute inset-0 bg-vertical-stripes bg-[length:100px_100px] opacity-60"></div>

    {/* Login Form Container */}
    <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
   
      <div className="flex justify-center mb-6">
    
      </div>
      {state.message && (
      <div
        className={`mb-4 p-2 rounded ${
          state.message === "Successfully Regsitered"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {state.message}
      </div>
    )}
      {/* Login Form */}
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Register to Iglu</h2>
      <form key ={key} action={formAction} className="space-y-4">
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
              {state.errors?.email && state.errors.email.map((error:string)=>(
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
            </div>
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            aria-describedby="username-error"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
            <div id="username-error" aria-live="polite" aria-atomic="true">
              {state.errors?.username && state.errors.username.map((error:string)=>(
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
            </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            aria-describedby="password-error"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
            <div id="password-error" aria-live="polite" aria-atomic="true">
              {state.errors?.password && state.errors.password.map((error:string)=>(
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
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
      <Link href="/"
         className="text-blue-500 underline ">Go to Login Page
      </Link>
      </div>
      </div>
    </div>
  );
}
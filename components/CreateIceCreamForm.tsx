'use client';
import React, {  useEffect, useState } from 'react';
import {  useFormState } from 'react-dom'
import { createIcecream,State } from '@/app/lib/actions';
import { Button } from '@headlessui/react';

const CreateIceCreamForm = () => {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useFormState(createIcecream, initialState);

  const [key, setKey] = useState(0);

  useEffect(() => {
    console.log("State changed:", state);
    if (state.message === "Ice cream added successfully") {
      console.log("Resetting form...");
      setKey(prevKey => prevKey + 1);
    }
  }, [state]);


  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md ">
          {state.message && (
      <div
        className={`mb-4 p-2 rounded ${
          state.message === "Ice cream added successfully"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {state.message}
      </div>
    )}
      <h2 className="text-2xl font-semibold mb-4">Add Ice Cream Item</h2>
      <form key ={key} action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="name">
            Ice Cream Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
  
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
     
            aria-describedby="name-error"
          />
        <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name && state.errors.name.map((error:string)=>(
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="category">
            Category
          </label>
          <select
            id="category"
    
            name="category"
       
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            aria-describedby="category-error"
          >
             <option value="">Select a category</option>
            <option value="IceCream">IceCream</option>
            <option value="milkshakes">Milkshakes</option>
            <option value="waffles">Waffles</option>
           
          </select>
          <div id="category-error" aria-live="polite" aria-atomic="true">
              {state.errors?.category && state.errors.category.map((error:string)=>(
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="cost">
            Price (in Rs)
          </label>
          <input
            type="number"
            id="cost"
            name="cost"

            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            placeholder="0.00"
            aria-describedby="cost-error"
          />
           <div id="cost-error" aria-live="polite" aria-atomic="true">
              {state.errors?.cost && state.errors.cost.map((error:string)=>(
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
            </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Add Item
          </Button>

      </form>
    </div>
  );
};

export default CreateIceCreamForm;

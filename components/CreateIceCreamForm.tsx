'use client';
import React, {  useEffect, useState } from 'react';
import {  useFormState } from 'react-dom'
import { createIcecream,getCategories,State } from '@/app/lib/actions';



const CreateIceCreamForm = () => {
  const [categories, setCategories] = useState<{id:number,name:string}[]>([]);
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useFormState(createIcecream, initialState);

  const [key, setKey] = useState(0);

  useEffect(() => {
    console.log("State changed:", state);
    if (state.message === "Added successfully") {
      console.log("Resetting form...");
      setKey(prevKey => prevKey + 1);
    }
  }, [state]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
       
        const categories = await getCategories();
     
        setCategories(categories.data);
      } catch  {
    
      }
    };

    fetchCategories();
  }, []); 

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md ">
          {state.message && (
      <div
        className={`mb-4 p-2 rounded ${
          state.message === "Added successfully"
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
             Name
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
            id="categoryId"
    
            name="categoryId"
       
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            aria-describedby="category-error"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
     
           
          </select>
          <div id="category-error" aria-live="polite" aria-atomic="true">
              {state.errors?.categoryId && state.errors.categoryId.map((error:string)=>(
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
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Add Item
          </button>

      </form>
    </div>
  );
};

export default CreateIceCreamForm;

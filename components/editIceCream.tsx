'use client';

import { CreateIcecream } from '@/app/validation_schemas';
import { UpdateIcecream,State } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { Category } from '@prisma/client';
import { useUser } from '@/context/UserContext';

const EditIceCreamForm =({ initialData }: { initialData: CreateIcecream | null}) => {
  const { userId } = useUser();
    const initialState: State = { message: "", errors: {} };
    const id = initialData?.id ?? 0;
    if (!userId) {
      throw new Error("User ID is required.");
    }
    const updateInvoiceWithId = (prevState: State, formData: FormData) => 
      UpdateIcecream(id, userId, prevState, formData);
  
    const [state, formAction] = useFormState(updateInvoiceWithId, initialState);

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Edit Ice Cream Item</h2>
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
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="name">
            Ice Cream Name
          </label>
          <input
             type="text"
             id="name"
             name="name"
             defaultValue={initialData?.name}
             
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
          defaultValue={initialData?.category}
          className="mt-1 block w-full p-2 border border-gray-300 rounded"
          aria-describedby="category-error"
          >
     {Object.values(Category).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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
           defaultValue={initialData?.cost}
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
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditIceCreamForm;

'use client';

import { CreateAddon, CreateIcecream } from '@/app/validation_schemas';
import { State, UpdateAddon } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { AddonCategory } from '@prisma/client';

const EditAddonForm =({ initialData }: { initialData: CreateAddon | null}) => {
    const initialState: State = { message: "", errors: {} };
    const id = initialData?.id ?? 0;
    const updateInvoiceWithId = UpdateAddon.bind(null, id);
 
    const [state, formAction] = useFormState(updateInvoiceWithId, initialState);


  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Edit Add-on Item</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="name">
            Add-on Name
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
     {Object.values(AddonCategory).map((category) => (
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

export default EditAddonForm;

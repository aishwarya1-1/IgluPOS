'use client';

import {   CreateAddon } from '@/app/validation_schemas';
import { UpdateIcecream,State, getCategories } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from '@/context/UserContext';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchKOTFromCache } from '@/app/lib/utils';
import { useKOTData } from '@/hooks/useKOTData';
import React from 'react';

const fetchCategories = async () => {
  const result = await getCategories()
  return {
    ...result,
    data: result.data.map(category => ({ ...category }))
  }
}
const EditIceCreamForm =({ initialData }: { initialData: CreateAddon | null}) => {
  const { userId } = useUser();
  const { toast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient()

  const [selectedCategory, setSelectedCategory] = useState("");
    const initialState: State = { message: "", errors: {} };
    const id = initialData?.id ?? 0;
    if (!userId) {
      throw new Error("User ID is required.");
    }
    const updateInvoiceWithId = (prevState: State, formData: FormData) => 
      UpdateIcecream(id, prevState, formData);
  
    const [state, formAction] = useFormState(updateInvoiceWithId, initialState);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsPasswordModalOpen(true);
    };
    const { data: categoriesData } = useQuery({
      queryKey: ['categories'],
      queryFn: fetchCategories,
      staleTime: 1000 * 60 * 60 * 12, // 12 hours
      gcTime: 1000 * 60 * 60 * 24
    })

  const categories = categoriesData?.data || []
  useEffect(() => {
    const fetchInitialCategory = async () => {
      try {


        if (initialData?.category) {
          const matchingCategory = categories.find(
            (cat) => cat.name === initialData.category
          );
          console.log("Matching category:", matchingCategory);

          if (matchingCategory) {
            setSelectedCategory(matchingCategory.id.toString());
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchInitialCategory();
  }, [initialData]);
  const { data: kotOrders} = useKOTData(userId);
  const verifyAndSubmit = async () => {
    setIsLoading(true);
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (password === adminPassword) {
      

     
 
        if (kotOrders === undefined) {
          console.log("something went wrong");
          toast({
            title: "Error",
            description: "Failed to check KOT status. Please try again.",
            variant: "destructive",
          });
          return;
        }
        let shouldEdit = kotOrders.data.length === 0;

  if (!shouldEdit) {
    const iceCreamInKOT = await searchKOTFromCache(id, userId, "icecream", kotOrders);
    shouldEdit = !iceCreamInKOT;
  }

      
      if (!shouldEdit) {
        toast({
          title: "Error",
          description: "Item in KOT. Cannot edit at this time.",
          variant: "destructive",
        });
        setIsPasswordModalOpen(false);
        setPassword('');
        return;
      }
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        queryClient.invalidateQueries({ queryKey: ['iceCreams'] })
        await formAction(formData);
      }
      setIsPasswordModalOpen(false);
      setPassword('');
  
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

    useEffect(() => {
      if(state.message){
      if (state.message === "Added successfully") {
        
        toast({
          title: "Success",
          description: "Changes saved successfully",
        });
      }
      else{
        toast({
          title: state.message,
          description: "Failed to save changes",
          variant: "destructive",
        });
      }
    }
    }, [state.message]);

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={verifyAndSubmit} disabled={isLoading}>
              Verify & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <h2 className="text-2xl font-semibold mb-4">Edit Ice Cream Item</h2>
    
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
          id="categoryId"
    
          name="categoryId"
          value= {selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded"
          aria-describedby="category-error"
          >
            <option value="" >
        Select a category
      </option>
     {Object.values(categories).map((category) => (
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
           defaultValue={initialData?.price}
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

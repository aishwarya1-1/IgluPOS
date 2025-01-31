'use client';

import { CreateAddon  } from '@/app/validation_schemas';
import { AddonState, UpdateAddon } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { AddonCategory } from '@prisma/client';
import { useUser } from '@/context/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useQueryClient } from '@tanstack/react-query';
import { searchKOTFromCache } from '@/app/lib/utils';
import { useKOTData } from '@/hooks/useKOTData';
import React from 'react';


const EditAddonForm = ({ initialData }: { initialData: CreateAddon | null }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { userId } = useUser();

  const initialState: AddonState = { message: "", errors: {} };
  const id = initialData?.id ?? 0;
  
  if (!userId) {
    throw new Error("User ID is required.");
  }
  
  const updateInvoiceWithId = (prevState: AddonState, formData: FormData) => 
    UpdateAddon(id, userId, prevState, formData);
  
  const [state, formAction] = useFormState(updateInvoiceWithId, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPasswordModalOpen(true);
  };
  const { data: kotOrders} = useKOTData(userId);
  const verifyAndSubmit = async () => {
    setIsLoading(true);
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    try {
      if (password === adminPassword) {
        console.log('orders')
        // Check if addon is in KOT before proceeding
      
 console.log('orders',kotOrders)
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
    const iceCreamInKOT = await searchKOTFromCache(id, userId, "addon", kotOrders);
    shouldEdit = !iceCreamInKOT;
  }

  if (!shouldEdit) {
    toast({
      title: "Error",
      description: "Item in KOT.",
      variant: "destructive",
    });
    setIsPasswordModalOpen(false);
    setPassword('');
    return;
  }
   

        // If not in KOT, proceed with update
        if (formRef.current) {
          const formData = new FormData(formRef.current);
          queryClient.invalidateQueries({ queryKey: ['addons'] });
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to check KOT status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      <h2 className="text-2xl font-semibold mb-4">Edit Add-on Item</h2>
   
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
            {state.errors?.name && state.errors.name.map((error: string) => (
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
            {state.errors?.category && state.errors.category.map((error: string) => (
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
            {state.errors?.price && state.errors.price.map((error: string) => (
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
'use client'

import React, { useState} from 'react';
import { Pen, Plus, Trash2, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, addCategory, updateCategory, deleteCategory, getAdonsData, deleteAddonById } from '@/app/lib/actions';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchKOTFromCache } from '@/app/lib/utils';
import { useKOTData } from '@/hooks/useKOTData';

const fetchCategories = async () => {
  const result = await getCategories()
  // Ensure we return a plain object
  return {
    ...result,
    data: result.data.map(item => ({ ...item }))
  }
}

const fetchAddons = async (userId :string) => {
  const result = await getAdonsData(userId)
  // Ensure we return a plain object
  return {
    ...result,
    data: result.data.map(item => ({ ...item }))
  }
}



const CategoryManagement = () => {
  const { userId } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // const [categories, setCategories] = useState<{id:number,name:string}[]>([]);
  const [activeTab, setActiveTab] = useState('Topping');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<{id:number,name:string} | null>(null);


  const [pendingAction, setPendingAction] = useState<{
    type: 'add' | 'edit' ;
    id?: number;
  } | null>(null);

  const { 
    data: categoriesData, 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24,   // 24 hours
  });

  const { 
    data: addonsData, 
    isLoading: addonsLoading 
  } = useQuery({
    queryKey: ['addons', userId],
    queryFn: () => fetchAddons(userId ?? ''),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24,   // 24 hours
  });

  

  const addons = addonsData?.data || []
  const categories = categoriesData?.data || []

  const isLoading = categoriesLoading || addonsLoading ;
  const verifyPassword = (adminAction: () => Promise<void>) => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (password === adminPassword) {
      adminAction();
      setIsPasswordModalOpen(false);
      setPassword('');
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };
  
  const handleAddCategory = async () => {
    console.log('adding category');

    const result = await addCategory(newCategory);


    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddModalOpen(false);
      setNewCategory('');

      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (id: number) => {
    console.log('editing category');
    if (!editingCategory) return;

    const result = await updateCategory(id, editingCategory.name);


    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);

      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    console.log('deleting category');
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    console.log('deleting category');

    const result = await deleteCategory(id);
  

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Category in use/DB issue.Failed to delete category",
        variant: "destructive",
      });
    }
  };
  const { data: kotOrders} = useKOTData(userId??'');
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this addon?');
    
    if (confirmDelete) {
      
        if (!userId) {
          throw new Error("User ID is required.");
        }
        
 
        if (kotOrders === undefined) {
          console.log("something went wrong");
          toast({
            title: "Error",
            description: "Failed to check KOT status. Please try again.",
            variant: "destructive",
          });
          return;
        }
        let shouldDelete = kotOrders.data.length === 0;

  if (!shouldDelete) {
    const iceCreamInKOT = await searchKOTFromCache(id, userId, "addon", kotOrders);
    shouldDelete = !iceCreamInKOT;
  }

  if (!shouldDelete) {
    toast({
      title: "Error",
      description: "Item in KOT.",
      variant: "destructive",
    });
    return;
  }
        const result = await deleteAddonById(id);
        if(result.success){
          queryClient.invalidateQueries({ queryKey: ['addons'] });
          toast({
            title: "Success",
            description: "Addon deleted successfully",
          });
        }
        else{
          toast({
            title: "Error",
            description: "Addon in order history/DB issue.Failed to delete",
            variant: "destructive",
          });
        }


    }
  }
  const initiateAction = (type: 'add' | 'edit' , id?: number) => {
    setPendingAction({ type, id });
    setIsPasswordModalOpen(true);
  };

  const executeAction = async () => {
    console.log('executing action');  
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case 'add':
        verifyPassword(() => handleAddCategory());
        break;
      case 'edit':
        verifyPassword(() => handleEditCategory(pendingAction.id!));
        break;
  

    }
  };
  const filteredAddons = addons.filter((addon) => addon.category === activeTab);
  return (
    <div className="p-4 sm:p-3 md:p-6 max-w-4xl mx-auto h-full sm:h-auto">
    <div className="flex justify-between items-center mb-6">
     
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center" disabled={isLoading}>
            <Plus size={16} /> Add Category
          </Button>
        </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button 
                onClick={() => initiateAction('add')} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Lock size={16} />
                {isLoading ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Password Verification Dialog */}
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
            <Button onClick={executeAction} disabled={isLoading}>
              Verify & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ice Cream Categories</CardTitle>
            <CardDescription>Manage ice cream product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, name: e.target.value })
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => initiateAction('edit', category.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? '...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCategory(null)}
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span>{category.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategory(category)}
                          disabled={isLoading}
                        >
                          <Pen size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isLoading}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          
        </Card>

        <Card>
      <CardHeader>
        <CardTitle>Addons Management</CardTitle>
        <CardDescription>Edit/Delete Addons</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-4">
          {['Topping', 'Cone'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 ${
                activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredAddons.length > 0 ? (
            filteredAddons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <>
                <div className="flex flex-col"> {/* Column for name and price */}
    <span className="font-medium">{addon.name}</span> {/* Display the name */}
    <span className="text-sm text-gray-600">Rs.{addon.price}</span> {/* Display the price below the name */}
  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" disabled={isLoading}>
                     
                      <Link href={{
                                            pathname: `/billing/${addon.id}/edit`,
                                            query: {
                                              name: addon.name,
                                              category: addon.category,
                                              price: addon.price,
                                              action: "addon",
                                            },
                         }}>
                            <Pen size={16} />
                            </Link>
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isLoading}
                    onClick={() => handleDelete(addon.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No addons available for {activeTab}.</p>
          )}
        </div>
      </CardContent>
    </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Manage admin email address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {isEditingEmail ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                    />
                    <Button
                      size="sm"
                      onClick={() => initiateAction('updateEmail')}
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setNewEmail(currentEmail);
                      }}
                      disabled={isLoading}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="break-all">{currentEmail}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingEmail(true)}
                      disabled={isLoading}
                    >
                      <Pen size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};


export default CategoryManagement;
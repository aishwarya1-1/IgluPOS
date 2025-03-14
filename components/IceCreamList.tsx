'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { searchKOTFromCache } from '@/app/lib/utils';
import { 
  getIceCreamData, 
  deleteIceCreamById, 

  getCategories 
} from '@/app/lib/actions'
import { useToast } from "@/hooks/use-toast"
import { useUser } from '@/context/UserContext'
import { useKOTData } from '@/hooks/useKOTData'
import React from 'react'


// Wrapper functions to handle server actions
const fetchIceCreams = async (userId: string) => {
  const result = await getIceCreamData(userId)
  // Ensure we return a plain object
  return {
    ...result,
    data: result.data.map(item => ({ ...item }))
  }
}

const fetchCategories = async () => {
  const result = await getCategories()
  // Ensure we return a plain object
  return {
    ...result,
    data: result.data.map(item => ({ ...item }))
  }
}

export default function IceCreamList() {
  const { userId } = useUser()
  const { toast } = useToast()
  
  const { addToCart } = useCart()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Query for ice cream data
  const { 
    data: iceCreamData,
    isLoading: isLoadingIceCreams,
    error: iceCreamError
  } = useQuery({
    queryKey: ['iceCreams'],
    queryFn: () => fetchIceCreams(userId ?? ''),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24
  })

  // Query for categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24
  })
  const { data: kotOrders} = useKOTData(userId??'');
  // Delete mutation
  const { mutate: deleteIceCream } = useMutation({
    mutationFn: async (id: number) => {
      if (!userId) {
        throw new Error("User ID is required.")
      }
      //


 
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
    const iceCreamInKOT = await searchKOTFromCache(id, userId, "icecream", kotOrders);
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
      
   
      
      const result = await deleteIceCreamById(id)
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['iceCreams'] });
        toast({
          title: "Success",
          description: "Ice cream deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Icecream exists in database.Failed to delete ice cream",
          variant: "destructive",
        });
      }
      
      return result;
    }
  })

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this ice cream?')
    if (confirmDelete) {
      deleteIceCream(id)
    }
  }

  // Loading state
  if (isLoadingIceCreams || isLoadingCategories) {
    return <div>Loading ice cream flavors...</div>
  }

  // Error state
  if (iceCreamError) {
    return <div>Error: {(iceCreamError as Error).message}</div>
  }

  const iceCreamFlavors = iceCreamData?.data || []
  const categories = categoriesData?.data || []

  // Filter flavors
  const filteredFlavors = iceCreamFlavors.filter((flavor) => {
    const matchesSearch = flavor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || flavor.category.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Rest of your component JSX remains the same */}
      <h2 className="text-2xl font-semibold mb-4">Ice Cream Flavors</h2>
      
      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border rounded w-48"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search flavors..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="h-[500px] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredFlavors.map((flavor) => (
            <div key={flavor.id} className="bg-gray-100 p-4 rounded-lg relative">
              <Menu as="div" className="absolute top-2 right-2">
                <Menu.Button className="p-1 rounded-full hover:bg-gray-200">
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                </Menu.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link href={{
                            pathname: `/billing/${flavor.id}/edit`,
                            query: {
                              name: flavor.name,
                              category: flavor.category.name,
                              price: flavor.cost,
                              action: "icecream",
                            },
                          }}>
                            <button
                              className={`${
                                active ? 'bg-blue-500 text-white' : 'text-gray-900'
                              } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              Edit
                            </button>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-red-500 text-white' : 'text-gray-900'
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            onClick={() => handleDelete(flavor.id)}
                          >
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <div className="mb-2">
                <h3 className="text-lg font-semibold">{flavor.name}</h3>
                <p className="text-xs italic text-gray-500">({flavor.category.name})</p>
              </div>
              <p className="text-gray-600 mb-4">{flavor.cost.toFixed(2)}</p>
              <button
                onClick={() => addToCart(flavor)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
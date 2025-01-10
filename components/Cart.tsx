'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { Menu, Transition } from '@headlessui/react'
import { TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import Link  from 'next/link'
import { deleteAddonById, getAdonsData } from '../app/lib/actions'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'; // Adjust the path if necessary
import { useRouter } from 'next/navigation'


type Addon = {
  id: number
  name: string
  price: number
  category: string
}

export default function Cart({ cartErrors }: { cartErrors?: string[] | null }) {
  const router = useRouter();
  const { cart, incrementItem, decrementItem, removeItem, addAddonToIcecream, decrementAddon, calculateTotalWithAddons ,removeAddonFromIcecream,totalCost} = useCart()
  const [showAddons, setShowAddons] = useState<{ [key: number]: boolean }>({})
  const [addonType, setAddonType] = useState<{ [key: number]: string | null }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [addons, setAddons] = useState<Addon[]>([])

  // Fetch addons on component mount
  useEffect(() => {
    const fetchAddons = async () => {
      const result = await getAdonsData()
      if (result.success) {
        setAddons(result.data)
      }
    }
    fetchAddons()
  }, [])



  const handleAddonsToggle = (itemId: number) => {
    setShowAddons((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
    setAddonType((prev) => ({ ...prev, [itemId]: null }))
  }

  const handleAddonSelection = (itemId: number, type: string) => {
    setAddonType((prev) => ({
      ...prev,
      [itemId]: type,
    }))
    setSearchQuery('')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  
  const closeAddons = (itemId: number) => {
    setShowAddons((prev) => ({ ...prev, [itemId]: false }))
    setAddonType((prev) => ({ ...prev, [itemId]: null }))
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this addon?');
    
    if (confirmDelete) {
      try {
        await deleteAddonById(id);
        setAddons(prevAddons => prevAddons.filter(addon => addon.id !== id));
        router.refresh();
      } catch (error) {
        console.error("Error deleting addon:", error);
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      {cartErrors && cartErrors.length > 0 && (
        <div className="mt-4 text-red-500">
          {cartErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <h2 className="text-2xl font-semibold mb-4">Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="space-y-4">
          {cart.map((item) => {
            const itemTotal = calculateTotalWithAddons(item.id)
            return (
              <li key={item.id} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-600">
                      Rs.{itemTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decrementItem(item.id)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => incrementItem(item.id)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 ml-2"
                      aria-label="Remove"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAddonsToggle(item.id)}
                      className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"
                      aria-label="Add-ons"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* List of selected add-ons */}
                {item.addons && item.addons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.addons.map((addon) => (
                      <div key={addon.addonId} className="flex items-center space-x-2 bg-gray-200 px-2 py-1 rounded">
                        <span>{addon.addonName}</span>
                        <span className="text-sm text-gray-600">
                          (Rs.{addon.addonPrice})
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              decrementAddon(item.id, addon.addonId);
                            }}
                            className="text-sm bg-gray-300 px-1 rounded"
                          >
                            -
                          </button>
                          <span className="text-sm">{addon.addonQuantity}</span>
                          <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              addAddonToIcecream(
                                item.id, 
                                addon.addonId,
                                addon.addonName,
                                addon.addonPrice
                              );
                            }}
                            className="text-sm bg-gray-300 px-1 rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeAddonFromIcecream(item.id, addon.addonId)}
                            className="text-red-500"
                            aria-label="Remove Add-on"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropdown for Add-ons */}
                {showAddons[item.id] && (
                  <div className="mt-2 bg-gray-100 p-2 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Choose Add-ons:</h3>
                      <button onClick={() => closeAddons(item.id)} className="text-red-500">
                        Close
                      </button>
                    </div>

                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleAddonSelection(item.id, 'cone')}
                        className={`px-2 py-1 rounded ${addonType[item.id] === 'cone' ? 'bg-gray-300' : 'bg-gray-200'}`}
                      >
                        Add Cone
                      </button>
                      <button
                        onClick={() => handleAddonSelection(item.id, 'topping')}
                        className={`px-2 py-1 rounded ${addonType[item.id] === 'topping' ? 'bg-gray-300' : 'bg-gray-200'}`}
                      >
                        Add Topping
                      </button>
                    </div>

                    {addonType[item.id] && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder={`Search ${addonType[item.id] === 'cone' ? 'cones' : 'toppings'}...`}
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="border rounded p-1 w-full"
                        />
                      </div>
                    )}

                    <div className="mt-2 space-y-1">
                      {addons
                        .filter(addon => addon.category.toLowerCase() === addonType[item.id]?.toLowerCase())
                        .filter(addon => 
                          addon.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(addon => (
                          <div className="flex justify-between items-center bg-gray-300 px-2 py-1 rounded w-full">
                          {/* Name and Price inside the parent button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation(); // Prevent event from propagating to parent elements
                              addAddonToIcecream(item.id, addon.id, addon.name, addon.price);
                            }}
                            className="w-full text-left flex flex-col"
                          >
                            <span>{addon.name}</span>
                            <span className="text-sm text-gray-600">Rs.{addon.price}</span>
                          </button>
                        
                          {/* Ellipsis Menu as a separate component */}
                          <Menu as="div" className="relative">
                            <Menu.Button
                              className="p-1 rounded-full hover:bg-gray-200"
                              onClick={(e) => e.stopPropagation()} // Prevent parent button click
                            >
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
                              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="px-1 py-1">
                                  <Menu.Item>
                                           {({ active }) => (
                                        <>
                                          <Link href={{
                                            pathname: `/billing/${addon.id}/edit`,
                                            query: {
                                              name: addon.name,
                                              category: addon.category,
                                              price: addon.price,
                                              action: "addon",
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
                                        </>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? 'bg-red-500 text-white' : 'text-gray-900'
                                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                        onClick={() => handleDelete(addon.id)}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                        
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <div className="mt-4 text-xl font-semibold">
        Total: Rs.{totalCost.toFixed(2)}
      </div>
    </div>
  )
}
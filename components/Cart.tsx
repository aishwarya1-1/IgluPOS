'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { getAdonsData } from '../app/lib/actions'
// import { IceCream } from '../context/CartContext'
// Update the type to match your database structure
type Addon = {
  id: number
  name: string
  cost: number,
  category: string
}
type AddonName = string
export default function Cart({ cartErrors }: { cartErrors?: string[] | null }) {
  const { cart, incrementItem, decrementItem, removeItem, addAddonToIcecream, decrementAddon, calculateTotalWithAddons ,removeAddonFromIcecream,totalCost} = useCart()
  const [showAddons, setShowAddons] = useState<{ [key: number]: boolean }>({})
  const [addonType, setAddonType] = useState<{ [key: number]: string | null }>({})
  const [searchQuery, setSearchQuery] = useState('')
  // const [selectedAddons, setSelectedAddons] = useState<{
  //   [key: number]: { [K in AddonName]?: number }
  // }>({})
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

  // Compute derived data from fetched addons
  // const coneOptions = addons.filter(addon => addon.category === 'Cone').map(addon => addon.name)
  // const toppingOptions = addons.filter(addon => addon.category === 'Topping').map(addon => addon.name)
  
  // // Replace the hardcoded ADDON_PRICES with a derived object
  // const ADDON_PRICES = Object.fromEntries(
  //   addons.map(addon => [addon.name, addon.cost])
  // )

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

  // const handleAddonClick = (itemId: number, addon: AddonName) => {
  //   setSelectedAddons((prev) => ({
  //     ...prev,
  //     [itemId]: {
  //       ...prev[itemId],
  //       [addon]: ((prev[itemId]?.[addon] || 0) + 1) as number
  //     }
  //   }))
  //   setSearchQuery('')
  // }

  // const decrementAddon = (itemId: number, addon: AddonName) => {
  //   setSelectedAddons((prev) => {
  //     const currentQuantity = prev[itemId]?.[addon] || 0
  //     if (currentQuantity <= 1) {
  //       const { [addon]: _, ...rest } = prev[itemId] || {}
  //       return {
  //         ...prev,
  //         [itemId]: rest
  //       }
  //     }
  //     return {
  //       ...prev,
  //       [itemId]: {
  //         ...prev[itemId],
  //         [addon]: currentQuantity - 1
  //       }
  //     }
  //   })
  // }

  // const removeAddon = (itemId: number, addon: AddonName) => {
  //   setSelectedAddons((prev) => {
  //     const { [addon]: _, ...rest } = prev[itemId] || {}
  //     return {
  //       ...prev,
  //       [itemId]: rest
  //     }
  //   })
  // }

  const closeAddons = (itemId: number) => {
    setShowAddons((prev) => ({ ...prev, [itemId]: false }))
    setAddonType((prev) => ({ ...prev, [itemId]: null }))
  }

  // const calculateItemTotal = (itemId: number, baseCost: number) => {
  //   const addonCosts = Object.entries(selectedAddons[itemId] || {}).reduce(
  //     (total, [addon, quantity]) => {
  //       return total + (ADDON_PRICES[addon as AddonName] * (quantity || 0))
  //     },
  //     0
  //   )
  //   return baseCost + addonCosts
  // }

  // const calculateCartTotal = () => {
  //   return cart.reduce((total, item) => {
  //     const itemTotal = calculateTotalWithAddons(item.id);
  //     return total + itemTotal;
  //   }, 0);
  // };

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
                {item.addons && (item.addons.topping.length > 0 || item.addons.cone.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[...item.addons.topping.map(addon => ({...addon, category: 'topping' as const})), 
                      ...item.addons.cone.map(addon => ({...addon, category: 'cone' as const}))
                    ].map((addon) => (
                      <div
                        key={addon.addonName}
                        className="flex items-center space-x-2 bg-gray-200 px-2 py-1 rounded"
                      >
                        <span>{addon.addonName}</span>
                        <span className="text-sm text-gray-600">
                          (Rs.{addon.addonPrice})
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              console.log('- button clicked');
                              e.preventDefault();
                              e.stopPropagation();
                              decrementAddon(item.id, addon.addonName, addon.category);
                            }}
                            className="text-sm bg-gray-300 px-1 rounded"
                          >
                            -
                          </button>
                          <span className="text-sm">{addon.addonQuantity}</span>
                          <button
                            onClick={(e) => {
                              console.log('+ button clicked');
                              e.preventDefault();
                              e.stopPropagation();
                              addAddonToIcecream(
                                item.id, 
                                addon.addonName, 
                                addon.category,
                                addon.addonPrice
                              );
                            }}
                            className="text-sm bg-gray-300 px-1 rounded"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeAddonFromIcecream(item.id, addon.addonName, addon.category)}
                          className="text-red-500"
                          aria-label="Remove Add-on"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
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
                          <button
                            key={addon.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addAddonToIcecream(
                                item.id, 
                                addon.name, 
                                addon.category.toLowerCase() as 'topping' | 'cone',
                                addon.cost
                              );
                            }}
                            className="bg-gray-300 px-2 py-1 rounded w-full text-left flex justify-between items-center"
                          >
                            <span>{addon.name}</span>
                            <span className="text-sm text-gray-600">
                              Rs.{addon.cost}
                            </span>
                          </button>
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
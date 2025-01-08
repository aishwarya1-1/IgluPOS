'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface IceCream {
  id: number
  name: string
  cost: number
}

interface AddonItem {
  addonName: string;
  addonPrice: number;
  addonQuantity: number;
}

interface Addons {
  cone: AddonItem[];
  topping: AddonItem[];
}

export interface CartItem extends IceCream {
  quantity: number;
  addons?: Addons;
}

interface CartContextType {
  cart: CartItem[]
  totalCost: number;
  addToCart: (item: IceCream) => void
  incrementItem: (id: number) => void
  decrementItem: (id: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
  populateCart: (items: CartItem[]) => void
  addAddonToIcecream: (itemId: number, addon: string, type: 'topping' | 'cone', price: number) => void;
  decrementAddon: (itemId: number, addon: string, type: 'topping' | 'cone') => void;
  calculateTotalWithAddons: (iceCreamId: number) => number;
  removeAddonFromIcecream: (itemId: number, addonName: string, type: 'topping' | 'cone') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const calculateTotalWithAddons = (iceCreamId: number) => {
    const item = cart.find(item => item.id === iceCreamId);
    if (!item) return 0;

    const baseCost = item.cost * item.quantity;
    if (!item.addons) return baseCost;

    const addonsCost = [
      ...item.addons.topping,
      ...item.addons.cone
    ].reduce((total, addon) => 
      total + (addon.addonPrice * addon.addonQuantity), 
      0
    );

    return baseCost + addonsCost;
  };

  const totalCost = cart.reduce((total, item) => 
    total + calculateTotalWithAddons(item.id), 0
  );

  const addToCart = (item: IceCream) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const incrementItem = (id: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decrementItem = (id: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }
  const populateCart = (items: CartItem[]) => {
    setCart(items)
  }

  const addAddonToIcecream = (itemId: number, addon: string, type: 'topping' | 'cone', price: number) => {
    console.log('addAddonToIcecream called with:', { itemId, addon, type, price });
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        if (item.id === itemId) {
          const currentAddons = item.addons || { topping: [], cone: [] };
          const addonList = [...currentAddons[type]];
          const existingAddonIndex = addonList.findIndex(a => a.addonName === addon);

          if (existingAddonIndex >= 0) {
            addonList[existingAddonIndex] = {
              ...addonList[existingAddonIndex],
              addonQuantity: addonList[existingAddonIndex].addonQuantity + 1
            };
          } else {
            addonList.push({
              addonName: addon,
              addonPrice: price,
              addonQuantity: 1
            });
          }

          return {
            ...item,
            addons: {
              ...currentAddons,
              [type]: addonList
            }
          };
        }
        return item;
      });

      return newCart;
    });
  };

  const decrementAddon = (itemId: number, addon: string, type: 'topping' | 'cone') => {
    console.log('decrementAddon called with:', { itemId, addon, type });
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId && item.addons) {
          const addonList = [...item.addons[type]];
          const existingAddonIndex = addonList.findIndex(a => a.addonName === addon);
          
          if (existingAddonIndex >= 0) {
            if (addonList[existingAddonIndex].addonQuantity > 1) {
              addonList[existingAddonIndex] = {
                ...addonList[existingAddonIndex],
                addonQuantity: addonList[existingAddonIndex].addonQuantity - 1
              };
            } else {
              return {
                ...item,
                addons: {
                  ...item.addons,
                  [type]: addonList.filter(a => a.addonName !== addon)
                }
              };
            }
          }

          return {
            ...item,
            addons: {
              ...item.addons,
              [type]: addonList
            }
          };
        }
        return item;
      });
    });
  };

  const removeAddonFromIcecream = (itemId: number, addonName: string, type: 'topping' | 'cone') => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId && item.addons) {
          const addonList = [...item.addons[type]];
          const addonIndex = addonList.findIndex(a => a.addonName === addonName);
          
          if (addonIndex >= 0) {
            // Remove the addon from the array
            addonList.splice(addonIndex, 1);
            
            return {
              ...item,
              addons: {
                ...item.addons,
                [type]: addonList
              }
            };
          }
        }
        return item;
      });
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalCost,
        addToCart,
        incrementItem,
        decrementItem,
        removeItem,
        clearCart,
        populateCart,
        addAddonToIcecream,
        calculateTotalWithAddons,
        decrementAddon,
        removeAddonFromIcecream,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

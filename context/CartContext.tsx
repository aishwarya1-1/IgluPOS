'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface IceCream {
  id: number
  name: string
  cost: number
}

export interface AddonItem {
  addonId: number;
  addonName: string;
  addonPrice: number;
  addonQuantity: number;
}


export interface CartItem extends IceCream {
  quantity: number;
  addons?: AddonItem[];
}
export interface Discount {
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
 id ?:number;
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
  addAddonToIcecream: (itemId: number, addonId: number, addon: string, price: number) => void;
  decrementAddon: (itemId: number,addonId: number) => void;
  calculateTotalWithAddons: (iceCreamId: number) => number;
  removeAddonFromIcecream: (itemId: number, addonId: number) => void;
  applyDiscount: (discount: Discount) => void;
  removeDiscount: () => void;
  currentDiscount : Discount | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null)
  const calculateTotalWithAddons = (iceCreamId: number): number => {
    // Find the ice cream item in the cart
    const item = cart.find(item => item.id === iceCreamId);
    if (!item) return 0; // If not found, return 0
  
    // Ensure `addons` is an array or default to an empty array
    const addons = Array.isArray(item.addons) ? item.addons : [];
  
    // Calculate the base cost (quantity * cost)
    const baseCost = item.cost * item.quantity;
  
    // Calculate the total cost of addons
    const addonsCost = addons.reduce((total, addon) => {
      return total + addon.addonPrice * addon.addonQuantity;
    }, 0);
  
    // Return the combined cost
    return baseCost + addonsCost;
  };

  const applyDiscount = (discount: Discount) => {
    // Set the current discount
    setCurrentDiscount(discount);
  };

  // New method to remove discount
  const removeDiscount = () => {
    setCurrentDiscount(null);
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + calculateTotalWithAddons(item.id);
    }, 0);
  };
  // Calculate the total cost for the entire cart
  const totalCost = (() => {
    const baseTotal = calculateCartTotal();
    
    // Apply discount if exists
    if (currentDiscount) {
      if (currentDiscount.type === 'PERCENTAGE') {
        return baseTotal * (1 - currentDiscount.value / 100);
      } else if (currentDiscount.type === 'FLAT') {
        return Math.max(baseTotal - currentDiscount.value, 0);
      }
    }
    
    return baseTotal;
  })();
  

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

  const addAddonToIcecream = (
    itemId: number,
    addonId: number,
    addonName: string,
    price: number
  ) => {
    console.log("addAddonToIcecream called with:", { itemId, addonId, addonName, price });
  
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          const currentAddons = item.addons || [];
          const addonIndex = currentAddons.findIndex((a) => a.addonId === addonId);
  
          let updatedAddons;
          if (addonIndex >= 0) {
            updatedAddons = currentAddons.map((addon, index) =>
              index === addonIndex
                ? { ...addon, addonQuantity: addon.addonQuantity + 1 }
                : addon
            );
            console.log("Addon quantity incremented:", updatedAddons[addonIndex]);
          } else {
            const newAddon = {
              addonId: addonId,
              addonName: addonName,
              addonQuantity: 1,
              addonPrice: price,
            };
            updatedAddons = [...currentAddons, newAddon];
            console.log("New addon added:", newAddon);
          }
  
          return {
            ...item,
            addons: updatedAddons,
          };
        }
        return item;
      })
    );
  };
  
  const decrementAddon = (itemId: number, addonId: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId && item.addons) {
          const addonList = [...item.addons];
          const existingAddonIndex = addonList.findIndex(a => a.addonId === addonId);
          
          if (existingAddonIndex >= 0) {
            if (addonList[existingAddonIndex].addonQuantity > 1) {
              addonList[existingAddonIndex] = {
                ...addonList[existingAddonIndex],
                addonQuantity: addonList[existingAddonIndex].addonQuantity - 1
              };
            } else {
              return {
                ...item,
                addons: addonList.filter(a => a.addonId !== addonId)
              };
            }
          }

          return {
            ...item,
            addons: addonList
          };
        }
        return item;
      });
    });
  };

  const removeAddonFromIcecream = (itemId: number, addonId: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId && item.addons) {
          const updatedAddons = item.addons.filter(a => a.addonId !== addonId);

          return {
            ...item,
            addons: updatedAddons
          };
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
        applyDiscount,
        removeDiscount,
        currentDiscount
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

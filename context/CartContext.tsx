'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react'

 export interface IceCream {
  id: number
  name: string
  cost: number
}

 export interface CartItem extends IceCream {
  quantity: number
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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const totalCost = cart.reduce((total, item) => total + item.cost * item.quantity, 0);

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

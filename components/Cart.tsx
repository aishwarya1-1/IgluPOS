'use client'

import { useCart } from '../context/CartContext'

export default function Cart({ cartErrors }: { cartErrors?: string[] }) {
  const { cart, incrementItem, decrementItem, removeItem ,totalCost} = useCart()


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
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              <span>{item.name} - Rs.{item.cost.toFixed(2)}</span>
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
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-xl font-semibold">
        Total: {totalCost.toFixed(2)}
      </div>
    </div>
  )
}
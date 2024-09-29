'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('credit')
  const { cart, clearCart } = useCart()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the order data to your backend
    console.log('Order submitted:', { cart, paymentMethod })
    // Clear the cart after successful submission
    clearCart()
    alert('Order submitted successfully!')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className=" mb-4">
      
        <div className="flex space-x-4">
  <div>
    <input type="radio" id="dine-in" name="orderType" value="dine-in" defaultChecked/>
    <label htmlFor="dine-in">Dine-in</label>
  </div>
  <div>
    <input type="radio" id="take-away" name="orderType" value="take-away" />
    <label htmlFor="take-away">Take-away</label>
  </div>
  <div>
    <input type="radio" id="delivery" name="orderType" value="delivery" />
    <label htmlFor="delivery">Delivery</label>
  </div>
</div>

          <label className="block mb-2 mt-8">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="credit">Credit Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          Place Order
        </button>
      </form>
    </div>
  )
}

'use client'

import { useFormState } from 'react-dom';
import { useCart } from '../context/CartContext'
import { useUser } from '@/context/UserContext';
import { BillState, createBill } from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import Cart from './Cart';

export default function Checkout() {
  const { cart, clearCart, totalCost } = useCart()
  const { userId } = useUser();
  
  const initialState: BillState = { message: "", errors: {} };

  const createBilling = async (prevState: BillState, formData: FormData) => {
    return createBill(cart, totalCost, userId, prevState, formData);
  };

  const [state, formAction] = useFormState(createBilling, initialState);
  const [key, setKey] = useState(0);
  const [action, setAction] = useState('');

  useEffect(() => {
    if (state.message === "Bill Added") {
      setKey(prevKey => prevKey + 1);
      clearCart();
      if (action === 'saveAndPrint') {
        printBill();
      }
    }
  }, [state, action]);

  const cartErrors = state.errors?.cart;

  const printBill = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { font-weight: bold; margin-top: 20px; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Iglu Ice Cream Shop</h1>
            <p>Nehru Nagar Belgaum</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="items">
            ${cart.map(item => `
              <div class="item">
                <span>${item.name} x ${item.quantity}</span>
                <span>Rs.${(item.cost * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <div class="item">
              <span>Subtotal:</span>
              <span>Rs.${totalCost.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>GST (10%):</span>
              <span>Rs.${(totalCost * 0.1).toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Total:</span>
              <span>Rs.${(totalCost * 1.1).toFixed(2)}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
              
            }
          </script>
        </body>
      </html>
    `;
  
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      // Handle the case where the window couldn't be opened
      alert("Unable to open print window. Please check your pop-up blocker settings and try again.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await formAction(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {state.message && (
        <div
          className={`mb-4 p-2 rounded ${
            state.message === "Bill Added"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}
      <Cart cartErrors={cartErrors} />
     
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <form key={key} onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex space-x-4">
            <div>
              <input type="radio" id="DineIn" name="orderType" value="DineIn" defaultChecked/>
              <label htmlFor="DineIn">Dine-in</label>
            </div>
            <div>
              <input type="radio" id="TakeAway" name="orderType" value="TakeAway" />
              <label htmlFor="TakeAway">Take-away</label>
            </div>
            <div>
              <input type="radio" id="Delivery" name="orderType" value="Delivery" />
              <label htmlFor="Delivery">Delivery</label>
            </div>
          </div>

          <label className="block mb-2 mt-8">Payment Method</label>
          <select
            id="modeOfPayment"
            name="modeOfPayment"
            className="w-full p-2 border rounded"
            aria-describedby="payment-error"
          >
            <option value="">Select a Payment method</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
          <div id="payment-error" aria-live="polite" aria-atomic="true">
            {state.errors?.modeOfPayment && state.errors.modeOfPayment.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>
        <div className="flex space-x-10">
          <button
            type="submit"
            onClick={() => setAction('save')}
            className="w-50 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Save
          </button>
          <button
            type="submit"
            onClick={() => setAction('saveAndPrint')}
            className="w-50 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Save and Print
          </button>
        </div>
      </form>
    </div>
  )
}
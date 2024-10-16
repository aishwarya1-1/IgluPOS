'use client';

import { useFormState } from 'react-dom';
import { CartItem, useCart } from '../context/CartContext';
import { useUser } from '@/context/UserContext';
import { BillState, createBill } from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import Cart from './Cart';
import { useRouter } from 'next/navigation'; 

export default function Checkout({ billKey }: { billKey?: string }) {
  const { cart, clearCart, totalCost ,populateCart} = useCart();
  const { userId } = useUser();

  const initialState: BillState = { message: '', errors: {} };

  const createBilling = async (prevState: BillState, formData: FormData) => {
    return createBill(cart, totalCost, userId, prevState, formData);
  };

  const [state, formAction] = useFormState(createBilling, initialState);
  const [key, setKey] = useState(0);
  const [action, setAction] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [billKeyKOT, setBillKeyKOT] = useState<string | undefined>(billKey);
  const router = useRouter();
   const [displayMessage, setDisplayMessage] = useState(initialState.message);
  useEffect(() => {

    if(billKeyKOT){
      setBillKeyKOT(billKey)
      const item = localStorage.getItem(billKeyKOT);

      if (item) {
        const parsedData = JSON.parse(item);
     
        populateCart(parsedData.cart)
      }
    }
  
    setDisplayMessage(state.message); 
    if (state.message === 'Bill Added') {
      

      setKey((prevKey) => prevKey + 1); // Reset form key to clear form
      clearCart(); 
      if(billKeyKOT){
      localStorage.removeItem(billKeyKOT)
      setBillKeyKOT("")
      }
      printBill();
      router.push('/billing'); 
    }
      const timer = setTimeout(() => {
         state.message=""
        setDisplayMessage(""); 
      }, 3000);

      return () => clearTimeout(timer); // Cleanup timer on unmount

     
  }, [state.message,billKeyKOT]);
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
            ${cart
              .map(
                (item) => `
              <div class="item">
                <span>${item.name} x ${item.quantity}</span>
                <span>Rs.${(item.cost * item.quantity).toFixed(2)}</span>
              </div>
            `
              )
              .join('')}
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
              };
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
      alert('Unable to open print window. Please check your pop-up blocker settings and try again.');
    }
  };



  const handleSave = async () => {
    setIsDialogVisible(false);
 try{
     const billData = {
        cart,
        totalCost,
   
        date: new Date().toLocaleDateString(),
      };
      if(billKeyKOT){
        localStorage.setItem(billKeyKOT, JSON.stringify(billData));
        setBillKeyKOT("");
        clearCart();
        router.push('/billing'); 
      }
      else{
    
      localStorage.setItem(`table_${customerName}`, JSON.stringify(billData));
      clearCart();
      }
     
    
      setDisplayMessage("Bill Saved");
      setTimeout(() => {
        setDisplayMessage("");
      }, 3000);
  
      
    }catch (error) {
      console.error('Error saving bill:', error);
      
      let errorMessage = "An error occurred while saving the bill";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setDisplayMessage(errorMessage);
      setTimeout(() => {
        setDisplayMessage("");
      }, 3000);
    }

  };
  const handleCancel =() =>{
    setIsDialogVisible(false);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (action === 'save') {
      if(billKeyKOT){
        await handleSave();
      }
      else if (cart.length > 0 ) {
       
        setIsDialogVisible(true);
      }
  

    } else {
  
      await formAction(formData);
    
  }

  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
      {displayMessage && (
        <div
          className={`mb-4 p-2 rounded text-sm ${
            displayMessage === 'Bill Added' || displayMessage === 'Bill Saved'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {displayMessage}
        </div>
      )}
      <Cart cartErrors={state.errors?.cart} />

      <h2 className="text-xl font-semibold mb-4">Checkout</h2>
      <form key={key} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <input type="radio" id="DineIn" name="orderType" value="DineIn" defaultChecked className="mr-2" />
              <label htmlFor="DineIn">Dine-in</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="TakeAway" name="orderType" value="TakeAway" className="mr-2" />
              <label htmlFor="TakeAway">Take-away</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="Delivery" name="orderType" value="Delivery" className="mr-2" />
              <label htmlFor="Delivery">Delivery</label>
            </div>
          </div>

          <label className="block mb-2 mt-4 text-sm font-medium">Payment Method</label>
          <select
            id="modeOfPayment"
            name="modeOfPayment"
            className="w-full p-2 border rounded text-sm"
            aria-describedby="payment-error"
          >
            <option value="">Select a Payment method</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
          <div id="payment-error" aria-live="polite" aria-atomic="true">
            {state.errors?.modeOfPayment &&
              state.errors.modeOfPayment.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            onClick={() => setAction('save')}
            className={`w-full px-4 py-2 rounded text-sm font-medium transition ${
              cart.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={cart.length === 0}
          >
            KOT
          </button>

          <button
            type="submit"
            onClick={() => setAction('saveAndPrint')}
            className="w-full bg-green-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-600 transition"
          >
            Save and Print
          </button>
        </div>
      </form>

      {isDialogVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
              Enter Table Number/Customer name
            </label>
            <input
              type="text"
              id="customerName"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                onClick={handleSave}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

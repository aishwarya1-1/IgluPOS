'use client';

import { useFormState } from 'react-dom';
import { CartItem, useCart } from '../context/CartContext';
import { useUser } from '@/context/UserContext';
import { appendKOTorder, BillState, createBill, createKOTBill, deleteKOTorder, editKOTorder} from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import Cart from './Cart';
import { useRouter } from 'next/navigation'; 
import { useToast } from "@/hooks/use-toast"

export default function Checkout({ kotid,cartItems, kotAction }: { kotid?: number; kotAction?: string ;cartItems?:string;}) {
  const { cart, clearCart, totalCost, populateCart } = useCart();
  const { userId } = useUser();
  const { toast } = useToast()
  const [kotActionState, setKotActionState] = useState<string | undefined>();

  const createBilling = async (prevState: BillState, formData: FormData ) => {
    const currentKotActionState = kotActionState;
  

    return createBill(cart, totalCost, userId, prevState, formData,currentKotActionState);
    
  };
  const initialState: BillState = { message: '', errors: {} };
  const [state, formAction] = useFormState(createBilling, initialState);
  const [key, setKey] = useState(0);
  const [action, setAction] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const router = useRouter();

  const [isKOTDisabled, setIsKOTDisabled] = useState(false);
  const [isSaveAndPrintDisabled, setIsSaveAndPrintDisabled] = useState(false);


  // Common print styles for thermal paper
  const getCommonPrintStyles = () => `
    @page {
      size: 80mm 210mm;
      margin: 0;
    }
    @media print {
      body {
        width: 80mm;
        margin: 0;
        padding: 5mm;
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .header {
        text-align: center;
        margin-bottom: 10px;
      }
      .items {
        margin-bottom: 10px;
      }
      .item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
    }
  `;

  // Function for customer bill (Print 1)
  const printCustomerBill = (billNo : string | null) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Bill</title>
          
          <style>${getCommonPrintStyles()}</style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 16px; margin: 0;">Iglu Ice Cream Shop</h1>
           <p style="margin: 5px 0;">Branch Id: ${userId}</p>
            <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; font-weight: bold;">CUSTOMER COPY</p>
            ${billNo ? `<p style="margin: 5px 0;">Bill Number: ${billNo}</p>` : ''}
          </div>
          <div class="items">
            ${cart.map(item => `
              <div class="item">
                <span>${item.name} x ${item.quantity}</span>
                <span>Rs.${(item.cost * item.quantity).toFixed(2)}</span>
              </div>
             ${item.addons && item.addons.length > 0 ? `
                <div class="addons" style="margin-left: 20px; font-size: 11px;">
                  <div>Addons:</div>
                  ${item.addons.map(addon => `
                    <div class="addon-item">
                      <span>${addon.addonName} x ${addon.addonQuantity}</span>
                      <span>Rs.${(addon.addonPrice * addon.addonQuantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
             
                </div>
              ` : ''}
            `).join('')}
          </div>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <div class="total">
           
            <div class="item" style="font-weight: bold;">
              <span>Total:</span>
              <span>Rs.${totalCost.toFixed(2)}</span>
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

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  // Function for kitchen order (Print 2)
  const printKitchenOrder = (kot : number | undefined) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kitchen Order</title>
          <style>${getCommonPrintStyles()}</style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 16px; margin: 0;">Iglu Ice Cream Shop</h1>
            <p style="margin: 5px 0;">Branch Id: ${userId}</p>
            <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;">Time: ${new Date().toLocaleTimeString()}</p>
            <p style="margin: 5px 0; font-weight: bold;">KITCHEN COPY</p>
            ${kot ? `<p style="margin: 5px 0;">KOT Number: ${kot}</p>` : ''}
          </div>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <div class="items">
            ${cart.map(item => `
              <div class="item" style="justify-content: flex-start; gap: 20px;">
                <span style="font-size: 14px; font-weight: bold;">${item.quantity}x</span>
                <span style="font-size: 14px;">${item.name}</span>
              </div>
              ${item.addons && item.addons.length > 0 ? `
                <div class="addons" style="margin-left: 40px; font-size: 12px;">
                  <div>Addons:</div>
                  ${item.addons.map(addon => `
                    <div style="margin-left: 10px;">
                      ${addon.addonName} x ${addon.addonQuantity}
                    </div>
                  `).join('')}
            
                </div>
              ` : ''}
            `).join('')}
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

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };
  
  // useEffect for handling kotAction
useEffect(() => {
  const handleKotAction = async () => {
    if (!kotAction) {
      setKotActionState(undefined)
      setIsSaveAndPrintDisabled(false);
      setIsKOTDisabled(false);
      clearCart();
  
      return;
    }

    console.log('Processing kotAction:', kotAction);

    if (kotAction === 'checkout') {
      setKotActionState('checkout');
      setIsKOTDisabled(true);
      setIsSaveAndPrintDisabled(false);
    } else if (kotAction === 'append') {
      setKotActionState('append');
     setIsSaveAndPrintDisabled(true);
      setIsKOTDisabled(false);
      clearCart();
    } else if (kotAction === 'edit') {
      setKotActionState('edit');
      setIsSaveAndPrintDisabled(true);
      setIsKOTDisabled(false);
    }

    if (cartItems && (kotAction === 'checkout' || kotAction === 'edit')) {
      const parsedCartItems = JSON.parse(decodeURIComponent(cartItems));
      const secParsedCartItems = JSON.parse(parsedCartItems);

      if (Array.isArray(secParsedCartItems)) {
        const itemsToPopulate = kotAction === 'edit'
          ? secParsedCartItems[secParsedCartItems.length - 1]
          : secParsedCartItems.flat();
    

        const consolidatedArray = itemsToPopulate.reduce((acc: CartItem[], item: CartItem) => {
          const existingItem = acc.find((i) => i.name === item.name);
          if (existingItem) {
            existingItem.quantity += item.quantity;
            if(item.addons){
            item.addons.forEach((addon) => {
              const existingAddon = existingItem.addons?.find((a) => a.addonName === addon.addonName);
              if (existingAddon) {
                existingAddon.addonQuantity += addon.addonQuantity; // Increase quantity of the existing addon
              } else {
                existingItem.addons?.push({ ...addon }); // Add new addon if it doesn't exist
              }
            
            });
          }
          } else {
            acc.push({ ...item });
          }
          return acc;
        }, [] as CartItem[]);

      
        populateCart(consolidatedArray);
      }
    } else if (!cartItems && (kotAction === 'checkout' || kotAction === 'edit')) {
      toast({
        title: "Error",
        description: "Cart is empty. Something went wrong'",
        variant: "destructive",
      });
   
    }
  };

  handleKotAction();
  console.log('kot',kotActionState)
  console.log('Checkout Rendered')
}, [kotAction]);

// useEffect for handling printing based on state.message
useEffect(() => {
  let hasPrinted = false;

  const handlePrint = async () => {
    if (state.message.startsWith('Failed to add')) {
      toast({
        title: "Error",
        description: 'Failed to Add Bill',
        variant: "destructive",
      });
      return
    }
    if(!state.message || hasPrinted) {
      return}
    hasPrinted = true;

    const UserKOTCounter = state.message.split(',');
 

    const userOrderId = UserKOTCounter[0] ? UserKOTCounter[0].trim() : null;  // Get the first part and trim whitespace
const kotSave = UserKOTCounter[1] ? parseInt(UserKOTCounter[1].trim()) : undefined; // Get the second part and trim whitespace



    setKey((prevKey) => prevKey + 1);

    if (kotActionState === 'checkout') {
      await printCustomerBill(userOrderId);
      await deleteKOTorder(kotid,userId);
    } else {
      await printCustomerBill(userOrderId);

      await new Promise((resolve) => {
        const checkPrintWindow = setInterval(() => {
          if (!window.frames[0]) {
            clearInterval(checkPrintWindow);
            resolve(true);
          }
        }, 500);
      });

      setTimeout(() => printKitchenOrder(kotSave), 1000);
   
    }

    // Clear cart and reset page
    clearCart();
    toast({
      title: "Success",
      description: "Bill Added",
     
    });
    router.push('/billing');
  };

  handlePrint();
}, [state.message]);


  const handleSave = async () => {
    setIsDialogVisible(false);
    try {

      if(kotActionState){
        if(kotActionState==='append'){
          try{
          const appendRes=await appendKOTorder(kotid,cart,totalCost,userId)
          printKitchenOrder(appendRes.kotNum);
        clearCart();
        toast({
          title: "Success",
          description: 'New Items added to KOT',
        });
   
        router.push('/billing');
          }catch(error){
            console.log(error)
            toast({
              title: "Error",
              description: "Something went wrong,Failed to Add",
              variant: "destructive",
            });
          }
        }
        else if(kotActionState==='edit'){
          try{
          const editRes=await editKOTorder(kotid,cart,totalCost,userId)
          printKitchenOrder(editRes.kotNum);
          clearCart();
          toast({
            title: "Success",
            description: 'Last KOT order Edited',
          });
          router.push('/billing');
          }catch(error){
            console.log(error)
            toast({
              title: "Error",
              description: "Something went wrong,Failed to Edit",
              variant: "destructive",
            });
          }
        }
      } else {
        const response = await createKOTBill([cart], totalCost, userId, customerName);
      if (response?.message === "KOT Bill Added") {
    
        printKitchenOrder(response.kotNum);
        clearCart();
        toast({
          title: "Success",
          description: 'KOT Added',
        });
       
      }
      }
      
   
    } catch (error) {
      console.error('Error saving bill:', error);
      let errorMessage 
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: errorMessage,
        description:'An error occurred while saving the bill',
        variant: "destructive",
      });
    }
  };
  const handleCancel =() =>{
    setIsDialogVisible(false);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (action === 'save') {
      if(kotActionState){
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
              isKOTDisabled || cart.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={isKOTDisabled || cart.length === 0}
          >
            KOT
          </button>

          <button
            type="submit"
            onClick={() => setAction('saveAndPrint')}
            className={`w-full px-4 py-2 rounded text-sm font-medium transition 
            ${isSaveAndPrintDisabled ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}
          `}
            disabled={isSaveAndPrintDisabled}
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

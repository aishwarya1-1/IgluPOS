
'use client';

import { useFormState } from 'react-dom';
import { CartItem, useCart } from '../context/CartContext';
import { useUser } from '@/context/UserContext';
import { appendKOTorder, BillState, createBill, createKOTBill, editKOTorder} from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import Cart from './Cart';
import { useRouter } from 'next/navigation'; 
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from '@tanstack/react-query';

import { isMobileDevice } from '@/app/lib/device';
import { RawBTPrinter } from '@/app/lib/rawBT';

export default function Checkout({ kotid,cartItems, kotAction }: { kotid?: number; kotAction?: string ;cartItems?:string;}) {
  const { cart, clearCart, totalCost, populateCart } = useCart();
  const { userId } = useUser();
  
  const queryClient = useQueryClient();
  const { toast } = useToast()
  const isMobile = isMobileDevice();
  const [kotActionState, setKotActionState] = useState<string | undefined>();

  const createBilling = async (prevState: BillState, formData: FormData ) => {
    const currentKotActionState = kotActionState;
  

    return createBill(cart, totalCost, userId, prevState, formData,currentKotActionState,kotid);
    
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

    const [isKOTPrintEnabled, setIsKOTPrintEnabled] = useState(true);
  
    const toggleKOTPrint = () => {
      setIsKOTPrintEnabled(!isKOTPrintEnabled);
    };
    
    let printFrame: HTMLIFrameElement | null = null;
const getPrintFrame = () => {
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '-9999px';
    printFrame.style.bottom = '-9999px';
    document.body.appendChild(printFrame);
  }
  return printFrame;
};

const printDocument = (content: string): Promise<void> => {
  return new Promise((resolve) => {
    const frame = getPrintFrame();
    const doc = frame.contentWindow?.document;
    
    if (!doc) {
      resolve();
      return;
    }
    // Clear previous content
    doc.open();
    doc.write('');
    doc.close();
    // Write new content
    doc.open();
    doc.write(`
      <style>
        @page { size: 80mm auto; margin: 0; }
        @media print {
          body { 
            margin: 5mm; 
            font-family: monospace; 
            font-size: 12px;
            width: 70mm;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
            width: 100%;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .addon-row {
            margin-left: 15px;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
          }
          .kitchen-item {
            display: flex;
            gap: 10px;
            margin: 5px 0;
          }
          .kitchen-addon {
            margin-left: 30px;
            font-size: 11px;
          }
          .page-break {
            page-break-after: always;
          }
        }
      </style>
      ${content}
    `);
    doc.close();
    
    const onPrintComplete = () => {
      frame.contentWindow?.removeEventListener('afterprint', onPrintComplete);
      resolve();
    };
    
    frame.contentWindow?.addEventListener('afterprint', onPrintComplete);
    frame.contentWindow?.print();
  });
};

const printCustomerBillDesktop = async (billNo: string | null) => {
  const content = `
    <div class="text-center">
      <div class="title">Iglu Ice Cream Shop</div>
      <p style="margin: 5px 0;">Branch Id: ${userId}</p>
      <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
      <p style="margin: 5px 0;" class="font-bold">CUSTOMER COPY</p>
      ${billNo ? `<p style="margin: 5px 0;">Bill Number: ${billNo}</p>` : ''}
    </div>
    
    ${cart.map(item => `
      <div class="item-row">
        <span>${item.name} x ${item.quantity}</span>
        <span>Rs.${(item.cost * item.quantity).toFixed(2)}</span>
      </div>
      ${item.addons?.length ? 
        item.addons.map(addon => `
          <div class="addon-row">
            <span>${addon.addonName} x ${addon.addonQuantity}</span>
            <span>Rs.${(addon.addonPrice * addon.addonQuantity).toFixed(2)}</span>
          </div>
        `).join('') : ''
      }
    `).join('')}
    
    <div class="divider"></div>
    <div class="font-bold text-right">
      Total: Rs.${totalCost.toFixed(2)}
    </div>
    <div style="margin-top: 10px; text-align: center;">
      Thank you for your purchase!
    </div>
  `;
  
  await printDocument(content);
};

const printKitchenOrderDesktop = async (kot: number | undefined) => {
  const content = `
    <div class="text-center">
      <div class="title">Iglu Ice Cream Shop</div>
      <p>Branch Id: ${userId}</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <p>Time: ${new Date().toLocaleTimeString()}</p>
      <p class="font-bold">KITCHEN COPY</p>
      ${kot ? `<p>KOT Number: ${kot}</p>` : ''}
    </div>
    
    <div class="divider"></div>
    
    ${cart.map(item => `
      <div class="kitchen-item">
        <span class="font-bold">${item.quantity}x</span>
        <span>${item.name}</span>
      </div>
      ${item.addons?.length ? 
        item.addons.map(addon => `
          <div class="kitchen-addon">
            ${addon.addonName} x ${addon.addonQuantity}
          </div>
        `).join('') : ''
      }
    `).join('')}
  `;
  
  await printDocument(content);
};
const printCombinedBillDesktop = async (billNo: string | null, kot: number | undefined) => {
  // Define ESC/POS commands for thermal printers

  const GS = '\x1D';
  const CUT_PAPER = GS + 'V' + '\x00';
  
  const content = `
    <!-- Customer Copy -->
    <div class="text-center">
      <div class="title">Iglu Ice Cream Shop</div>
      <p style="margin: 5px 0;">Branch Id: ${userId}</p>
      <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
      <p style="margin: 5px 0;" class="font-bold">CUSTOMER COPY</p>
      ${billNo ? `<p style="margin: 5px 0;">Bill Number: ${billNo}</p>` : ''}
    </div>
    
    ${cart.map(item => `
      <div class="item-row">
        <span>${item.name} x ${item.quantity}</span>
        <span>Rs.${(item.cost * item.quantity).toFixed(2)}</span>
      </div>
      ${item.addons?.length ? 
        item.addons.map(addon => `
          <div class="addon-row">
            <span>${addon.addonName} x ${addon.addonQuantity}</span>
            <span>Rs.${(addon.addonPrice * addon.addonQuantity).toFixed(2)}</span>
          </div>
        `).join('') : ''
      }
    `).join('')}
    
    <div class="divider"></div>
    <div class="font-bold text-right">
      Total: Rs.${totalCost.toFixed(2)}
    </div>
    <div style="margin-top: 10px; text-align: center;">
      Thank you for your purchase!
    </div>
    
    <!-- Paper Cut Command -->
    <pre style="visibility: hidden;">${CUT_PAPER}</pre>
    
    <!-- Kitchen Copy -->
    <div class="text-center">
      <div class="title">Iglu Ice Cream Shop</div>
      <p>Branch Id: ${userId}</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <p>Time: ${new Date().toLocaleTimeString()}</p>
      <p class="font-bold">KITCHEN COPY</p>
      ${kot ? `<p>KOT Number: ${kot}</p>` : ''}
    </div>
    
    <div class="divider"></div>
    
    ${cart.map(item => `
      <div class="kitchen-item">
        <span class="font-bold">${item.quantity}x</span>
        <span>${item.name}</span>
      </div>
      ${item.addons?.length ? 
        item.addons.map(addon => `
          <div class="kitchen-addon">
            ${addon.addonName} x ${addon.addonQuantity}
          </div>
        `).join('') : ''
      }
    `).join('')}
  `;
  
  await printDocument(content);
};

  // Function for customer bill (Print 1)
  const printCustomerBill = async (billNo: string | null) => {
    try {
      if (!userId) {
        return;
      }
      
      if(isMobile){
      await RawBTPrinter.printCustomerBill(cart, totalCost, billNo, userId)
    }
    else{
      await printCustomerBillDesktop(billNo)
    }
    } catch {
      toast({
        title: "Error",
        description: "Failed to print customer bill",
        variant: "destructive",
      });
    }
  };
  
  const printKitchenOrder = async (kot: number | undefined) => {
    try {
      if (!userId) {
        return;
      }
      
      if(isMobile){

      
      await RawBTPrinter.printKitchenOrder(cart, kot, userId)
    }
    else{
      await printKitchenOrderDesktop(kot)
    }
    } catch {
      toast({
        title: "Error",
        description: "Failed to print kitchen order",
        variant: "destructive",
      });
    }
  };
  
  const printCombinedOrder = async (kot: number | undefined, billNo: string | null) => {
    try {
      if (!userId) {
        return;
      }
      
      if(isMobile){
      await  RawBTPrinter.printCombinedOrder(
        cart,
        totalCost,
        billNo,
        kot,
        userId
      )
  
  }
  else {
    // Print both documents with minimal delay
  await printCombinedBillDesktop(billNo,kot)
  }
    } catch {
      toast({
        title: "Error",
        description: "Failed to print Bills",
        variant: "destructive",
      });
    }
  };
  // const cleanup = () => {
  //   if (printFrame) {
  //     document.body.removeChild(printFrame);
  //     printFrame = null;
  //   }
  // };
  // useEffect(() => {
  //   return () => cleanup();
  // }, []);
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

}, [kotAction]);

// useEffect for handling printing based on state.message
useEffect(() => {
  let hasPrinted = false;

  const handlePrint = async () => {
    if (state.message.startsWith('Failed to add')) {
      toast({
        title: "Error",
        description: state.message,
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
      console.log("Before printing customer bill...");
      await printCustomerBill(userOrderId);
     console.log("KOT order deleted, invalidating cache...");
        queryClient.invalidateQueries({ queryKey: ["kot-data", userId] });

    } else {
      if(isKOTPrintEnabled){
      await printCombinedOrder(
        
        kotSave,
        userOrderId
      );
    }
   else{
    await printCustomerBill(userOrderId)
   }
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
          if(!appendRes.kotNum){
            toast({
              title: "Error",
              description: appendRes.message,
              variant: "destructive",
            });
          }
          else{
          queryClient.invalidateQueries({ queryKey: ['kot-data', userId]});
          if(isKOTPrintEnabled){
          printKitchenOrder(appendRes.kotNum);
          }
        clearCart();
        toast({
          title: "Success",
          description: 'New Items added to KOT',
        });
   
        router.push('/billing');
      }
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
          if(!editRes.kotNum){
            toast({
              title: "Error",
              description: editRes.message,
              variant: "destructive",
            });
          }
          else{
          queryClient.invalidateQueries({ queryKey: ['kot-data', userId] });
          if(isKOTPrintEnabled){
          printKitchenOrder(editRes.kotNum);
          }
          clearCart();
          toast({
            title: "Success",
            description: 'Last KOT order Edited',
          });
          router.push('/billing');
        }
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
        queryClient.invalidateQueries({ queryKey: ['kot-data', userId] });
        if(isKOTPrintEnabled){
        printKitchenOrder(response.kotNum);
        }
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
     <div className="flex items-center justify-between mb-4">
        <label htmlFor="kot-print-toggle" className="text-sm font-medium text-black-700">
          Enable KOT Print
        </label>
        <button
          id="kot-print-toggle"
          type="button"
          onClick={toggleKOTPrint}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isKOTPrintEnabled ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isKOTPrintEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
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
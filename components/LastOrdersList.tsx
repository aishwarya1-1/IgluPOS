'use client';

import { RecentOrder, updatePaymentMode } from '@/app/lib/actions';
import { format } from 'date-fns';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from "@/hooks/use-toast";
import { ModeOfPayment } from '@prisma/client';
import { useRouter } from 'next/navigation';

type PartPayment = {
  Cash: number;
  UPI: number;
  Card: number;
};

export default function LastOrdersList({ orders }: { orders: RecentOrder[] }) {
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [editingPartPayOrder, setEditingPartPayOrder] = useState<number | null>(null);
  const [isPartPay, setIsPartPay] = useState(false);
  const [partPayment, setPartPayment] = useState<PartPayment>({ Cash: 0, UPI: 0, Card: 0 });
  const { userId } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handlePaymentModeChange = async (orderId: number, newPaymentMode: ModeOfPayment, paymentDetails?: PartPayment) => {
    try {
      const result = await updatePaymentMode(orderId, userId, newPaymentMode, paymentDetails);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Payment mode updated successfully",
        });
        setEditingOrder(null);
        setEditingPartPayOrder(null);
        setIsPartPay(false);
        setPartPayment({ Cash: 0, UPI: 0, Card: 0 });
        
        // Refresh the page data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch  {
      toast({
        title: "Error",
        description: "Failed to update payment mode",
        variant: "destructive",
      });
    }
  };
  const formatDiscountText = (type: 'FLAT' | 'PERCENTAGE', value: number) => {
    return type === 'FLAT' ? 
      `₹${value} off` : 
      `${value}% off`;
  };
  const handleAmountChange = (method: keyof PartPayment, value: number) => {
    setPartPayment(prev => ({ ...prev, [method]: value }));
  };

  const calculateRemaining = (totalCost: number) => {
    const total = partPayment.Cash + partPayment.UPI + partPayment.Card;
    return totalCost - total;
  };

  const handleEditPartPay = (orderId: number, currentDetails: PartPayment) => {
    setEditingPartPayOrder(orderId);
    setPartPayment(currentDetails);
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const remaining = calculateRemaining(order.totalCost);
        const isValid = remaining >= 0;
        const isEditingThisOrder = editingOrder === order.id;
        const isEditingThisPartPay = editingPartPayOrder === order.id;

        return (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Bill #{order.userOrderId}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(order.orderDate), 'PPpp')}
                </p>
                {(order.discount || order.coupon) && (
                <div className="mt-1 text-xs">
                  {order.discount && (
                    <span className="inline-flex items-center px-2 py-1 mr-2 rounded-full text-green-700 bg-green-100">
                      🏷️ Discount applied: {formatDiscountText(order.discount.type, order.discount.value)}
                    </span>
                  )}
                  {order.coupon && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-blue-700 bg-blue-100">
                      🎟️ Coupon applied: {formatDiscountText(order.coupon.type, order.coupon.value)}
                    </span>
                  )}
                </div>
              )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₹{order.totalCost.toFixed(2)}</p>
                {isEditingThisOrder ? (
                  <div className="space-y-2">
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      defaultValue={order.modeOfPayment}
                      onChange={(e) => {
                        if (e.target.value === 'PartPay') {
                          setIsPartPay(true);
                        } else {
                          handlePaymentModeChange(order.id, e.target.value as ModeOfPayment);
                        }
                      }}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="PartPay">Split Payment</option>
                    </select>

                    {isPartPay && (
                      <div className="mt-2 p-3 border rounded">
                        {(Object.keys(partPayment) as Array<keyof PartPayment>).map((method) => (
                          <div key={method} className="flex items-center gap-2 mb-2">
                            <label className="w-16">{method}</label>
                            <input
                              type="number"
                              value={partPayment[method] || ''}
                              onChange={(e) => handleAmountChange(method, parseFloat(e.target.value) || 0)}
                              className={`border p-1 w-24 ${isValid ? "" : "border-red-500"}`}
                            />
                          </div>
                        ))}
                        <p className={`text-sm ${isValid ? "text-gray-500" : "text-red-500"}`}>
                          Remaining: ₹{remaining.toFixed(2)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            disabled={!isValid || remaining !== 0} 
                            onClick={() => handlePaymentModeChange(order.id, 'PartPay', partPayment)}
                            className={`bg-blue-500 text-white p-2 rounded ${!isValid || remaining !== 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            Confirm Split
                          </button>
                          <button 
                            onClick={() => {
                              setIsPartPay(false);
                              setPartPayment({ Cash: 0, UPI: 0, Card: 0 });
                            }}
                            className="bg-gray-500 text-white p-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-end gap-2">
                      <p 
                        className="text-sm text-gray-600 cursor-pointer hover:text-blue-500"
                        onClick={() => setEditingOrder(order.id)}
                      >
                        {order.modeOfPayment}
                      </p>
                      {order.modeOfPayment === 'PartPay' && order.paymentDetails && (
                        <button
                          onClick={() => handleEditPartPay(order.id, order.paymentDetails as PartPayment)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          ✏️ Edit Split
                        </button>
                      )}
                    </div>
                    {order.modeOfPayment === 'PartPay' && order.paymentDetails && !isEditingThisPartPay && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(order.paymentDetails as PartPayment)
                          .filter(([, amount]) => amount > 0)
                          .map(([method, amount]) => (
                            <div key={method}>
                              {method}: ₹{amount.toFixed(2)}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )}
                {isEditingThisPartPay && (
                  <div className="mt-2 p-3 border rounded">
                    {(Object.keys(partPayment) as Array<keyof PartPayment>).map((method) => (
                      <div key={method} className="flex items-center gap-2 mb-2">
                        <label className="w-16">{method}</label>
                        <input
                          type="number"
                          value={partPayment[method] || ''}
                          onChange={(e) => handleAmountChange(method, parseFloat(e.target.value) || 0)}
                          className={`border p-1 w-24 ${isValid ? "" : "border-red-500"}`}
                        />
                      </div>
                    ))}
                    <p className={`text-sm ${isValid ? "text-gray-500" : "text-red-500"}`}>
                      Remaining: ₹{remaining.toFixed(2)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        disabled={!isValid || remaining !== 0} 
                        onClick={() => handlePaymentModeChange(order.id, 'PartPay', partPayment)}
                        className={`bg-blue-500 text-white p-2 rounded ${!isValid || remaining !== 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Update Split
                      </button>
                      <button 
                        onClick={() => {
                          setEditingPartPayOrder(null);
                          setPartPayment({ Cash: 0, UPI: 0, Card: 0 });
                        }}
                        className="bg-gray-500 text-white p-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600">{order.orderType}</p>
              </div>
            </div>

            <div className="space-y-2">
              {order.orderItems.map((item, index) => (
                <div key={index} className="border-t pt-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {item.iceCream.name} x {item.quantity}
                      </p>
                      {item.addons.length > 0 && (
                        <div className="ml-4 text-sm text-gray-600">
                          {item.addons.map((addon, addonIndex) => (
                            <p key={addonIndex}>
                              + {addon.addon.name} x {addon.quantity}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      ₹{(item.itemCost * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

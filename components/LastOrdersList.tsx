'use client';

import { RecentOrder, updatePaymentMode } from '@/app/lib/actions';
import { format } from 'date-fns';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from "@/hooks/use-toast";
import { ModeOfPayment } from '@prisma/client';

export default function LastOrdersList({ orders }: { orders: RecentOrder[] }) {
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const { userId } = useUser();
  const { toast } = useToast();

  const handlePaymentModeChange = async (orderId: number, newPaymentMode: ModeOfPayment) => {
    try {
      const result = await updatePaymentMode(orderId, userId, newPaymentMode);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Payment mode updated successfully",
        });
        setEditingOrder(null);
        // Optionally refresh the data here if needed
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment mode",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Bill #{order.userOrderId}
              </h3>
              <p className="text-sm text-gray-500">
                {format(new Date(order.orderDate), 'PPpp')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">₹{order.totalCost.toFixed(2)}</p>
              {editingOrder === order.id ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  defaultValue={order.modeOfPayment}
                  onChange={(e) => handlePaymentModeChange(order.id, e.target.value as ModeOfPayment)}
                  onBlur={() => setEditingOrder(null)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                </select>
              ) : (
                <p 
                  className="text-sm text-gray-600 cursor-pointer hover:text-blue-500"
                  onClick={() => setEditingOrder(order.id)}
                >
                  {order.modeOfPayment} (click to edit)
                </p>
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
      ))}
    </div>
  );
}

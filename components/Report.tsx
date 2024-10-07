"use client";
import { getReport } from '@/app/lib/actions';
import { generateCSV } from '@/app/lib/utils';
import { useUser } from '@/context/UserContext';
import { Button } from '@headlessui/react';
import { format } from 'date-fns';

import React from 'react'
import {  DateRange } from 'react-day-picker'


export function Report({ data }: { data: DateRange | undefined }) {
    const { userId } = useUser();
    const handleClick = async () => {
        if(data !== undefined){
            if (data.from && data.to) {
        
        const startDate = format(data.from, "yyyy-MM-dd");
        const endDate = format(data?.to, "yyyy-MM-dd");
        try{
        const detailedOrders=await getReport(startDate,endDate,userId)
        const transformedData = detailedOrders.map((order) => {
                      const gst = order.cost * 0.1; // 10% tax
                      const finalTotal = (order.cost * order.quantity) +gst;
                      
            
                      return {
                        Date: format(order.date, "yyyy-MM-dd HH:mm:ss"),
                        "Invoice ID": order.orderId,
                        "Mode of Payment": order.modeOfPayment,
                        "Order Type": order.orderType,
                        Branch: order.username,
                        "Ice Cream Name": order.iceCreamName,
                        Cost: order.cost,
                        Quantity: order.quantity,
                        GST: gst,
                        Category: order.category,
                        "Final Total": finalTotal,
                        
                      };
                    });
                await generateCSV(transformedData);

        }catch(error)
        {
            console.log(error)
        }
            }}
    }
    return (
        <Button onClick={handleClick}  className="text-black font-semibold py-2 px-4  hover:text-blue-500 transition duration-300 ease-in-out">
          Download Report for selected Dates
        </Button>
      );
}




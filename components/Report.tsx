"use client";
import { getReport } from '@/app/lib/actions';
import { TransformedOrderItem } from '@/app/lib/utils';
import { useUser } from '@/context/UserContext';
import { Button } from '@headlessui/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';

export function Report({ data }: { data: DateRange | undefined }) {
   
    const { userId } = useUser();
    const [error, setError] = useState<string | null>(null); 


    const generateCSV = (data: TransformedOrderItem[]): string => {
        const headers = [
            "Date",
            "Invoice ID",
            "Mode of Payment",
            "Order Type",
            "Branch",
            "Ice Cream Name",
            "Cost",
            "Quantity",
            "GST",
            "Category",
            "Final Total",
        ];

        const csvContent = [
            headers.join(","),
            ...data.map((item) =>
                headers
                    .map((header) =>
                        typeof item[header as keyof TransformedOrderItem] === "string"
                            ? `"${item[header as keyof TransformedOrderItem]}"`
                            : item[header as keyof TransformedOrderItem]
                    )
                    .join(",")
            ),
        ].join("\n");

        return csvContent;
    };

    const downloadCSV = (csvContent: string, fileName: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleClick = async () => {
       
        if (data?.from && data?.to) {
            setError(null)
            const startDate = format(data.from, "yyyy-MM-dd");
            const endDate = format(data.to, "yyyy-MM-dd");
            try {
                const detailedOrders = await getReport(startDate, endDate, userId);
                const transformedData = detailedOrders.map((order) => {
                    const gst = order.cost * 0.1; // 10% tax
                    const finalTotal = (order.cost * order.quantity) + gst;
                    
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

                const csvContent = generateCSV(transformedData);
                const fileName = `order_data_${Date.now()}.csv`;
                downloadCSV(csvContent, fileName);

            } catch (error) {
                console.error("Error generating report:", error);
                setError("Failed to generate the report. Please try again.");
            }
        }
        else{
            setError("Please select a valid date range.");
        }
    };

    return (
        <div>
        <Button onClick={handleClick} className="text-black font-semibold py-2 px-4 hover:text-blue-500 transition duration-300 ease-in-out">
            Download Report for selected Dates
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
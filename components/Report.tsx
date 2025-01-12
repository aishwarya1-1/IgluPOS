"use client";
import { getReport } from '@/app/lib/actions';
import { TransformedOrderItem } from '@/app/lib/utils';
import { useUser } from '@/context/UserContext';
import { Button } from '@headlessui/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';

type Addon = {
  addonId: number;
  addon: {
    name: string;
    category: string; // Adjust as necessary
  };
  quantity: number;
  priceAtTime: number;
};

export function Report({ data }: { data: DateRange | undefined }) {
    const { userId } = useUser();
    const [error, setError] = useState<string | null>(null);

    const generateAnalytics = (orders: any[]) => {
        // Ice cream analysis
        const iceCreamAnalytics = orders.reduce((acc, order) => {
            const key = order.iceCreamName;
            if (!acc[key]) {
                acc[key] = {
                    name: key,
                    quantity: 0,
                    revenue: 0,
                    category: order.category
                };
            }
            acc[key].quantity += order.quantity;
            acc[key].revenue += (order.cost * order.quantity);
            return acc;
        }, {});

        // Addons analysis
        const addonAnalytics = orders.reduce((acc, order) => {
            order.addons?.forEach((addon: Addon) => {
                const key = addon.addon.name;
                if (!acc[key]) {
                    acc[key] = {
                        name: key,
                        quantity: 0,
                        revenue: 0
                    };
                }
                acc[key].quantity += addon.quantity;
                acc[key].revenue += (addon.priceAtTime * addon.quantity);
            });
            return acc;
        }, {});

        // Category analysis
        const categoryAnalytics = orders.reduce((acc, order) => {
            const key = order.category;
            if (!acc[key]) {
                acc[key] = {
                    name: key,
                    quantity: 0,
                    revenue: 0
                };
            }
            acc[key].quantity += order.quantity;
            acc[key].revenue += (order.cost * order.quantity);
            return acc;
        }, {});

        return {
            iceCream: Object.values(iceCreamAnalytics).sort((a: any, b: any) => b.revenue - a.revenue),
            addons: Object.values(addonAnalytics).sort((a: any, b: any) => b.quantity - a.quantity),
            categories: Object.values(categoryAnalytics).sort((a: any, b: any) => b.revenue - a.revenue)
        };
    };

    const generateCSV = (data: TransformedOrderItem[], analytics: any): string => {
        let csvContent = "";

        // Detailed Orders Section
        csvContent += "DETAILED ORDERS\n";
        const headers = [
            "Date",
            "Invoice ID",
            "Mode of Payment",
            "Order Type",
            "Branch",
            "Ice Cream Name",
            "Cost",
            "Quantity",
            "Sub Total",
            "GST",
            "Category",
            "Addons",
            "AddonsTotal",
            "Final Total",
        ];

        csvContent += headers.join(",") + "\n";
        csvContent += data.map((item) =>
            headers
                .map((header) => {
                    const value = item[header as keyof TransformedOrderItem];
                    return typeof value === "string" ? `"${value}"` : value;
                })
                .join(",")
        ).join("\n");

        // Ice Cream Analysis Section
        csvContent += "\n\nICE CREAM ANALYSIS (Sorted by Revenue)\n";
        csvContent += "Ice Cream Name,Category,Quantity Sold,Total Revenue\n";
        csvContent += analytics.iceCream.map((item: any) =>
            `"${item.name}","${item.category}",${item.quantity},${item.revenue.toFixed(2)}`
        ).join("\n");

        // Addons Analysis Section
        csvContent += "\n\nADDONS ANALYSIS (Sorted by Quantity)\n";
        csvContent += "Addon Name,Quantity Sold,Total Revenue\n";
        csvContent += analytics.addons.map((item: any) =>
            `"${item.name}",${item.quantity},${item.revenue.toFixed(2)}`
        ).join("\n");

        // Category Analysis Section
        csvContent += "\n\nCATEGORY ANALYSIS (Sorted by Revenue)\n";
        csvContent += "Category,Total Quantity,Total Revenue\n";
        csvContent += analytics.categories.map((item: any) =>
            `"${item.name}",${item.quantity},${item.revenue.toFixed(2)}`
        ).join("\n");

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
            setError(null);
            const startDate = format(data.from, "yyyy-MM-dd");
            const endDate = format(data.to, "yyyy-MM-dd");
            try {
                const gstRate = 0;
                const detailedOrders = await getReport(startDate, endDate, userId);
                const transformedData = detailedOrders.map((order) => {
                    const subTotal = order.cost * order.quantity;
                    const gst = order.cost * gstRate;
                    const addonsTotal = order.addons.reduce((total, addon) => 
                        total + addon.priceAtTime * addon.quantity, 0);
                    const finalTotal = (order.cost * order.quantity) + gst + (addonsTotal ?? 0);
                    
                    return {
                        Date: format(order.date, "yyyy-MM-dd HH:mm:ss"),
                        "Invoice ID": order.orderId,
                        "Mode of Payment": order.modeOfPayment,
                        "Order Type": order.orderType,
                        Branch: order.username,
                        "Ice Cream Name": order.iceCreamName,
                        Cost: order.cost,
                        Quantity: order.quantity,
                        "Sub Total": subTotal,
                        GST: gst,
                        Category: order.category,
                        Addons: order.addons.map(addon => 
                            `${addon.addon.name} (${addon.quantity})`).join(', '),
                        AddonsTotal: addonsTotal,
                        "Final Total": finalTotal,
                    };
                });

                const analytics = generateAnalytics(detailedOrders);
                const csvContent = generateCSV(transformedData, analytics);
                const fileName = `sales_report_${format(data.from, "yyyy-MM-dd")}_to_${format(data.to, "yyyy-MM-dd")}.csv`;
                downloadCSV(csvContent, fileName);

            } catch (error) {
                console.error("Error generating report:", error);
                setError("Failed to generate the report. Please try again.");
            }
        } else {
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
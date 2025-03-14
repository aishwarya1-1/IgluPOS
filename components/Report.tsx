"use client";
import { getReport } from '@/app/lib/actions';
import { TransformedOrderItem } from '@/app/lib/utils';
import { useUser } from '@/context/UserContext';
import { Button } from '@headlessui/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DetailedOrderItem ,Orders} from '@/app/lib/actions';

type Addon = {
  id: number;
  addon: {
    name: string;
    category: string;
  };
  quantity: number;
  priceAtTime: number;
};

interface IceCreamAnalytics {
    [key: string]: {
        name: string;
        quantity: number;
        revenue: number;
        category: string;
    }
}

interface AddonAnalytics {
    [key: string]: {
        name: string;
        quantity: number;
        revenue: number;
    }
}

// New interfaces for analytics results
interface IceCreamAnalyticsResult {
    name: string;
    quantity: number;
    revenue: number;
    category: string;
}

interface AddonAnalyticsResult {
    name: string;
    quantity: number;
    revenue: number;
}

interface AnalyticsResults {
    iceCream: IceCreamAnalyticsResult[];
    addons: AddonAnalyticsResult[];
    categories: AddonAnalyticsResult[];
}

export function Report({ data }: { data: DateRange | undefined }) {
    const gstRate: number = parseFloat(process.env.GST ?? "0.0");
    const { userId } = useUser();
    const [error, setError] = useState<string | null>(null);

    const generateAnalytics = (orders: DetailedOrderItem[]): AnalyticsResults => {
        // Ice cream analysis
        const iceCreamAnalytics = orders.reduce<IceCreamAnalytics>((acc, order) => {
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
        const addonAnalytics = orders.reduce<AddonAnalytics>((acc, order) => {
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
        const categoryAnalytics = orders.reduce<AddonAnalytics>((acc, order) => {
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
            iceCream: Object.values(iceCreamAnalytics)
                .sort((a: IceCreamAnalyticsResult, b: IceCreamAnalyticsResult) => b.revenue - a.revenue),
            addons: Object.values(addonAnalytics)
                .sort((a: AddonAnalyticsResult, b: AddonAnalyticsResult) => b.quantity - a.quantity),
            categories: Object.values(categoryAnalytics)
                .sort((a: AddonAnalyticsResult, b: AddonAnalyticsResult) => b.revenue - a.revenue)
        };
    };

    const generateDetailedCSV = (data: TransformedOrderItem[], analytics: AnalyticsResults): string => {
        let csvContent = "";
        
        // Detailed Orders Section
        csvContent += "DETAILED ORDERS\n";
        const headers = [
            "Date",
            "Invoice ID",
            "Mode of Payment",
            "Order Type",
            "Branch",
            "Biller Name",
            "Ice Cream Name",
            "Category",
            "Cost",
            "Quantity",
       
            "Addons",
            "Addons Total",
            "Sub Total",
            "Discount",
            "Coupon",
            "Total After Discount",
            "GST Rate",
            "GST Amount",
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
        const grandTotal = data.reduce((sum, item) => {
            // Convert to number in case it's stored as string
            const finalTotal = typeof item["Final Total"] === "string" 
                ? parseFloat(item["Final Total"] as string) 
                : (item["Final Total"] as number);
            
            return sum + (isNaN(finalTotal) ? 0 : finalTotal);
        }, 0);
        
        // Add empty line and grand total row
        csvContent += "\n\n";
        
        // Create a row with empty cells until the Final Total column
        const emptyFields = Array(headers.length - 1).fill("").join(",");
        csvContent += `${emptyFields},"Grand Total: ${grandTotal.toFixed(2)}"`;
        // Ice Cream Analysis Section
        csvContent += "\n\nICE CREAM ANALYSIS (Sorted by Revenue)\n";
        csvContent += "Ice Cream Name,Category,Quantity Sold,Total Revenue\n";
        csvContent += analytics.iceCream.map((item) =>
            `"${item.name}","${item.category}",${item.quantity},${item.revenue.toFixed(2)}`
        ).join("\n");

        // Addons Analysis Section
        csvContent += "\n\nADDONS ANALYSIS (Sorted by Quantity)\n";
        csvContent += "Addon Name,Quantity Sold,Total Revenue\n";
        csvContent += analytics.addons.map((item) =>
            `"${item.name}",${item.quantity},${item.revenue.toFixed(2)}`
        ).join("\n");

        // Category Analysis Section
        csvContent += "\n\nCATEGORY ANALYSIS (Sorted by Revenue)\n";
        csvContent += "Category,Total Quantity,Total Revenue\n";
        csvContent += analytics.categories.map((item) =>
            `"${item.name}",${item.quantity},${item.revenue.toFixed(2)}`
        ).join("\n");

        return csvContent;
    };

    const generateOrdersCSV = (Orders: Orders[]): string => {
     
        

        let csvContent = "ORDERS REPORT\n";
        const headers = [
            "Date",
            "Order ID",
            "Mode of Payment",
            "Payment Details",
            "Order Type",
            "Biller Name",
            "Branch",
            "Ice Creams",
            "Has Addons",
            "Sub Total",
            "Discount",
            "Coupon",
            "Total After Discount",
            "GST Rate",
            "GST Amount",
            "Final Total"
          ];

          csvContent += headers.join(",") + "\n";
          csvContent += Orders.map(order => 
            headers.map(header => {
                const value = order[header as keyof Orders];
                if (header === "Date") {
                  return format(value as Date, "yyyy-MM-dd HH:mm:ss");
                }
                return typeof value === "string" ? `"${value}"` : value;
              }).join(",")
            ).join("\n");
          
            const grandTotal = Orders.reduce((sum, item) => {
                // Convert to number in case it's stored as string
                const finalTotal = typeof item["Final Total"] === "string" 
                    ? parseFloat(item["Final Total"] as string) 
                    : (item["Final Total"] as number);
                
                return sum + (isNaN(finalTotal) ? 0 : finalTotal);
            }, 0);
            
            // Add empty line and grand total row
            csvContent += "\n\n";
            
            // Create a row with empty cells until the Final Total column
            const emptyFields = Array(headers.length - 1).fill("").join(",");
            csvContent += `${emptyFields},"Grand Total: ${grandTotal.toFixed(2)}"`;
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

    const handleClick = async (reportType: 'detailed' | 'orders') => {
        if (data?.from && data?.to) {
            setError(null);
            const startDate = format(data.from, "yyyy-MM-dd");
            const endDate = format(data.to, "yyyy-MM-dd");
            try {
                const detailedOrders = await getReport(startDate, endDate, userId);
                const transformedData = detailedOrders.detailedItems.map((order) => {

                    const gst = order.finalTotal* gstRate;

                    return {
                        Date: format(order.date, "yyyy-MM-dd HH:mm:ss"),
                        "Invoice ID": order.orderId,
                        "Mode of Payment": order.modeOfPayment,
                        "Order Type": order.orderType,
                        "Branch": order.username,
                        "Biller Name": order.billerName,
                        "Ice Cream Name": order.iceCreamName,
                        "Category": order.category,
                        "Cost": order.cost,
                        "Quantity": order.quantity,
                        
                        "Addons": order.addons.map(addon => 
                            `${addon.addon.name} (${addon.quantity})`).join('; '),
                        "Addons Total": order.addonTotal,
                        "Sub Total": order.subtotal,
                        "Discount": order.discount,
                        "Coupon": order.coupon,
                        "Total After Discount" :order.finalTotal,
                        "GST Rate" : gstRate,
                        "GST Amount" : gst,
                        "Final Total": order.finalTotal+ gst
                      
                      
                    };
                });

                const analytics = generateAnalytics(detailedOrders.detailedItems);
                const dateStr = `${format(data.from, "yyyy-MM-dd")}_to_${format(data.to, "yyyy-MM-dd")}`;
                
                if (reportType === 'detailed') {
                    const csvContent = generateDetailedCSV(transformedData, analytics);
                    downloadCSV(csvContent, `detailed_report_${dateStr}.csv`);
                } else {
                    const csvContent = generateOrdersCSV(detailedOrders.orders);
                    downloadCSV(csvContent, `orders_report_${dateStr}.csv`);
                }

            } catch (error) {
                console.error("Error generating report:", error);
                setError("Failed to generate the report. Please try again.");
            }
        } else {
            setError("Please select a valid date range.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Button 
                    onClick={() => handleClick('detailed')} 
                    className="text-black font-semibold py-2 px-4 hover:text-blue-500 transition duration-300 ease-in-out"
                >
                    Download Detailed Report
                </Button>
                <Button 
                    onClick={() => handleClick('orders')} 
                    className="text-black font-semibold py-2 px-4 hover:text-blue-500 transition duration-300 ease-in-out"
                >
                    Download Orders Report
                </Button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
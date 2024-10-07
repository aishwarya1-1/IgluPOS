"use server";

import { DetailedOrderItem } from "./actions";
import { format } from "date-fns";
import { writeFile } from "fs/promises";

export interface TransformedOrderItem {
  Date: string;
  "Invoice ID": number;
  "Mode of Payment": string;
  "Order Type": string;
  Branch: string;
  "Ice Cream Name": string;
  Cost: number;
  Quantity: number;
  GST: number;
  Category: string;
  "Final Total": number;
}

// export function transformOrderData(
//   orders: DetailedOrderItem[]
// ): TransformedOrderItem[] {
//   return orders.map((order) => {
//     const finalTotal = order.cost * order.quantity;
//     const tax = finalTotal * 0.1; // 10% tax

//     return {
//       Date: format(order.date, "yyyy-MM-dd HH:mm:ss"),
//       "Invoice ID": order.orderId,
//       "Mode of Payment": order.modeOfPayment,
//       "Order Type": order.orderType,
//       Branch: order.username,
//       "Ice Cream Name": order.iceCreamName,
//       Cost: order.cost,
//       Quantity: order.quantity,
//       Category: order.category,
//       "Final Total": finalTotal,
//       Tax: tax,
//     };
//   });
// }

export async function generateCSV(
  data: TransformedOrderItem[]
): Promise<string> {
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

  const fileName = `order_data_${Date.now()}.csv`;
  const filePath = `/tmp/${fileName}`;

  await writeFile(filePath, csvContent);

  return fileName;
}

"use server";

export interface TransformedOrderItem {
  Date: string;
  "Invoice ID": number;
  "Mode of Payment": string;
  "Order Type": string;
  Branch: string;
  "Ice Cream Name": string;
  Cost: number;
  Quantity: number;
  "Sub Total": number;
  GST: number;
  Category: string;
  Addons: string;
  AddonsTotal: number;
  "Final Total": number;
}

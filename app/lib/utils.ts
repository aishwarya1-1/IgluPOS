import { CartItemSchemaType } from "../validation_schemas";
import { JsonValue } from "@prisma/client/runtime/library";

import { getKOTData } from "./actions";

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

export interface KOTDataResponse {
  success: boolean;
  data: {
    id: number;
    cartItems: JsonValue;
    kotNumber: number;
    kotName: string;
    total: number;
    lastUpdatedDate: Date;
  }[];
}

export const searchKOTFromCache = async (
  id: number,
  userId: string,
  action: string,
  kotOrders: KOTDataResponse
): Promise<boolean> => {
  const iceCreamIdToCheck = id;

  // Iterate through orders
  for (const order of kotOrders.data) {
    const cartItemsString = order.cartItems; // Get the cartItems value

    // Check if cartItemsString is a string and not null
    if (typeof cartItemsString !== "string") {
      console.error("cartItems is not a valid JSON string:", cartItemsString);
      continue; // Skip this order and move to the next one
    }

    const cartItems: CartItemSchemaType[][] = JSON.parse(cartItemsString); // Parse the cartItems

    // Iterate through each sub-array in cartItems
    for (const subArray of cartItems) {
      // Check if the action is for ice cream
      if (action === "icecream") {
        // Check if any item in the sub-array has a matching ID for ice cream
        if (subArray.some((item) => item.id === iceCreamIdToCheck)) {
          return true; // Return true immediately when a match is found
        }
      }
      // Check if the action is for an addon
      else if (action === "addon") {
        // Check if any item in the sub-array has a matching addon ID
        if (
          subArray.some((item) =>
            item.addons?.some((addon) => addon.addonId === iceCreamIdToCheck)
          )
        ) {
          return true; // Return true immediately when a match is found
        }
      }
    }
  }

  // If no matches are found, return false
  return false;
};

export const fetchKOTData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");
  console.log("here in kot");
  const result = await getKOTData(userId);
  return {
    ...result,
    data: result.data.map((item) => ({ ...item })),
  };
};

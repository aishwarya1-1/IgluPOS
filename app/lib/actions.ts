"use server";
import {
  createIceCreamSchema,
  registerUserSchema,
  createOrderSchema,
  dateRangeSchema,
  CreateIcecream,
  createAddonSchema,
  CreateAddon,
  createEmployeeSchema,
  editEmployeeSchema,
  resetPasswordSchema,
  updateProfile,
} from "../validation_schemas";
import { startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns";
import {
  AddonCategory,
  PrismaClient,
  ModeOfPayment,
  Prisma,
  DiscountType,
} from "@prisma/client";
import { CartItem } from "@/context/CartContext";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
const prisma = new PrismaClient();

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import crypto from "crypto";
import { JsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";
// const ENCRYPTION_KEY =
//   process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"; // 32 bytes
// const IV_LENGTH = 16; // For AES, this is always 16

export type State = {
  errors?: {
    name?: string[];
    categoryId?: string[];
    cost?: string[];
  };
  message?: string;
};

export type AddonState = {
  errors?: {
    name?: string[];
    category?: string[];
    price?: string[];
  };
  message?: string;
};
export type UserState = {
  errors?: {
    email?: string[];
    username?: string[];
    password?: string[];
    address?: string[];
    gstNumber?: string[];
  };
  message?: string;
};
export type BillState = {
  errors: {
    cart?: string[];

    modeOfPayment?: string[];
  };
  message: string;
};

export type EmployeeState = {
  errors?: {
    name?: string[];
    password?: string[];
    phoneNumber?: string[];
    _form?: string[];
  };
  message: string;
};

export interface SalesDataEntry {
  date: string;
  totalSales: number;
  totalQuantity: number;
}
export type DetailedOrderItem = {
  date: Date;
  orderId: number;
  modeOfPayment: string;
  orderType: string;
  username: string;
  iceCreamName: string;
  cost: number;
  quantity: number;
  category: string;
  billerName: string;
  discount: string;
  coupon: string;
  subtotal: number;
  addonTotal: number;
  finalTotal: number;

  addons: {
    id: number;
    priceAtTime: number;
    quantity: number;
    addon: {
      name: string;
      category: string;
    };
  }[];
};

export type Orders = {
  Date: Date;
  "Order ID": number;
  "Mode of Payment": string;
  "Payment Details": string;
  "Order Type": string;
  "Biller Name": string;
  Branch: string;
  "Ice Creams": string;
  "Has Addons": string;
  "Sub Total": number;
  Discount: string;
  Coupon: string;
  "Total After Discount": number;
  "GST Rate": number;
  "GST Amount": number;
  "Final Total": number;
};
export interface RecentOrder {
  id: number;
  userOrderId: number;
  orderDate: Date;
  modeOfPayment: string;
  orderType: string;
  totalCost: number;
  paymentDetails: JsonValue;
  discount?: {
    type: DiscountType;
    value: number;
  } | null;
  coupon?: {
    type: DiscountType;
    value: number;
  } | null;
  orderItems: {
    quantity: number;
    itemCost: number;
    iceCream: {
      name: string;
    };
    addons: {
      quantity: number;
      priceAtTime: number;
      addon: {
        name: string;
      };
    }[];
  }[];
}

export async function createIcecream(
  userId: string | undefined,
  prevState: State,
  formData: FormData
) {
  console.log("formData is", formData);
  const validatedFields = createIceCreamSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    cost: formData.get("cost"),
  });
  if (!userId) {
    return { message: "User ID is required" };
  }
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { name, categoryId, cost } = validatedFields.data;

  try {
    // Create a new ice cream entry in the database
    await prisma.iceCream.create({
      data: {
        name,
        categoryId: categoryId,
        cost,
        loginId: parseInt(userId),
      },
    });

    return {
      message: "Added successfully",
      errors: {},
    };
  } catch {
    return {
      message: "Failed to Add Ice Cream.",
      errors: {},
    };
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

//edit

export async function UpdateIcecream(
  id: number,

  prevState: State,
  formData: FormData
) {
  const validatedFields = createIceCreamSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    cost: formData.get("cost"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { name, categoryId, cost } = validatedFields.data;

  try {
    await prisma.iceCream.update({
      where: {
        id: id, // Specify the id of the ice cream to update
      },
      data: {
        name: name, // Update the name
        categoryId: categoryId, // Update the category
        cost: cost, // Update the cost
      },
    });
  } catch {
    return {
      message: "Failed to Update Ice Cream.",
      errors: {},
    };
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
  redirect("/billing");
}
//create addon
export async function createAddon(
  userId: string,
  prevState: AddonState,
  formData: FormData
) {
  const validatedFields = createAddonSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("cost"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { name, category, price } = validatedFields.data;

  try {
    // Create a new ice cream entry in the database
    await prisma.addon.create({
      data: {
        name,
        category: category as AddonCategory,
        price: price,
        loginId: parseInt(userId),
      },
    });

    return {
      message: "Added successfully",
      errors: {},
    };
  } catch {
    return {
      message: "Failed to Add the Addon.",
      errors: {},
    };
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}
//edit addon
export async function UpdateAddon(
  id: number,

  prevState: AddonState,
  formData: FormData
) {
  const validatedFields = createAddonSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("cost"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { name, category, price } = validatedFields.data;

  try {
    await prisma.addon.update({
      where: {
        id: id, // Specify the id of the ice cream to update
      },
      data: {
        name: name, // Update the name
        category: category as AddonCategory, // Update the category
        price: price, // Update the cost
      },
    });
  } catch {
    return {
      message: "Failed to Update Addon.",
      errors: {},
    };
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
  redirect("/billing/settings");
}

//getIcecream
export async function getIceCreamData(userId: string) {
  try {
    // await delay(500);
    console.log("icecreams fetched");
    const iceCreams: CreateIcecream[] = await prisma.iceCream.findMany({
      where: {
        loginId: parseInt(userId), // Filter by loginId
      },
      select: {
        id: true,
        name: true,
        cost: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: iceCreams,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      data: [],
    };
  }
}
export async function getAdonsData(userId: string) {
  try {
    console.log("addons fetched");
    const addons: CreateAddon[] = await prisma.addon.findMany({
      where: {
        loginId: parseInt(userId), // Filter by loginId
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
      },
    });

    return {
      success: true,
      data: addons,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      data: [],
    };
  }
}

export async function deleteIceCreamById(id: number) {
  try {
    // This is the command that tells Prisma to delete the ice cream based on its ID.
    await prisma.iceCream.delete({
      where: {
        id: id, // Specify the id of the ice cream you want to delete
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete ice cream with ID ${id}:`, error);
    return {
      success: false,
    };
  }
}
//delete addon by id
export async function deleteAddonById(id: number) {
  try {
    // This is the command that tells Prisma to delete the ice cream based on its ID.
    await prisma.addon.delete({
      where: {
        id: id, // Specify the id of the ice cream you want to delete
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete addon with ID ${id}:`, error);
    return {
      success: false,
    };
  }
}
//register

export async function registerUser(prevState: UserState, formData: FormData) {
  const validatedFields = registerUserSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    address: formData.get("address"),
    gstNumber: formData.get("gstNumber"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { email, username, password, address, gstNumber } =
    validatedFields.data;

  const encryptedPassword = await encrypt(password);
  try {
    // Create a new ice cream entry in the database
    await prisma.login.create({
      data: {
        email,
        username,
        password: encryptedPassword,
        address, // Add address field
        gstNumber,
        userOrderCounter: {
          create: {
            counter: 0, // Initial counter value
            KOTCounter: 0, // Initial KOTCounter value
            lastUpdated: new Date(), // Set to the current date
          },
        },
      },
    });

    return {
      message: "Successfully Registered",
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const e = error as { code: string }; // Type assertion
      if (e.code === "P2002") {
        return {
          message: "Username already exists",
          errors: {},
        };
      }
    }
    console.log(error);
    return {
      message: "Failed to register user",
      errors: {},
    };
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

//authenticate
export async function authenticateStore(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // Add role to the form data
    const userType = "store";

    const response = await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      userType,
      redirect: false,
    });

    // Check if authentication was successful
    if (response?.error) {
      return "Invalid store admin credentials.";
    }

    // If successful, redirect to admin dashboard
    redirect("/admin");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid store admin credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

// Function for authenticating employees
export async function authenticateEmployee(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // Add role to the form data
    const userType = "employee";

    const response = await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      userType,
      redirect: false,
    });

    // Check if authentication was successful
    if (response?.error) {
      return "Invalid employee credentials.";
    }

    // If successful, redirect to billing page
    redirect("/billing");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid employee credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
//discountid
async function getDiscountID(
  type: "FLAT" | "PERCENTAGE",
  value: number,
  tx: TransactionClient
) {
  // Check if the discount already exists
  const existingDiscount = await tx.discount.findUnique({
    where: { type_value: { type, value } },
  });

  if (existingDiscount) {
    console.log("Discount already exists:", existingDiscount);
    return existingDiscount.id;
  }

  // Create new discount only if it doesn't exist
  const newDiscount = await tx.discount.create({
    data: { type, value },
  });

  console.log("New discount created:", newDiscount);
  return newDiscount.id;
}

//billing
export async function createBill(
  cart: CartItem[],
  totalCost: number,
  userId: string | undefined,
  prevState: BillState,
  formData: FormData,
  kotActionState: string | undefined,
  kotid: number | undefined,
  billerName: string | undefined,
  partPayment: { Cash: number; UPI: number; Card: number },
  currentDiscount: {
    type: "PERCENTAGE" | "FLAT";
    value: number;
    id?: number;
  } | null
) {
  let userOrderId: number | null = null;
  let kotSave: number | null = null;

  const validatedFields = createOrderSchema.safeParse({
    cart: cart,
    modeOfPayment: formData.get("modeOfPayment"),
    orderType: formData.get("orderType"),
    totalCost: totalCost,
    userId: userId,
  });

  if (!validatedFields.success) {
    console.log("zod error", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }

  const {
    cart: validatedCart,
    modeOfPayment,
    orderType,
    totalCost: total,
    userId: user,
  } = validatedFields.data;
  const paymentDetails =
    modeOfPayment === "PartPay" ? partPayment : Prisma.JsonNull;
  let couponId: number | null;
  let discountId: number | null;
  let getDiscount = false;

  if (!currentDiscount) {
    couponId = null;
    discountId = null;
  } else if (currentDiscount.id) {
    couponId = currentDiscount.id;
    discountId = null;
  } else {
    couponId = null;
    getDiscount = true;
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Handle KOT and Order Counter
        if (!kotActionState && userId) {
          const result = await updateKOTCounter(userId, true, tx);
          kotSave = result.kotCounter;
          userOrderId = result.orderCounter ?? null;
        } else {
          const userOrderCounter = await tx.userOrderCounter.update({
            where: { loginId: user },
            data: {
              counter: { increment: 1 },
            },
            select: {
              counter: true,
            },
          });
          userOrderId = userOrderCounter.counter;
        }

        if (userOrderId === null) {
          throw new Error("Failed to generate order ID");
        }
        if (!billerName) {
          billerName = "Failed to fetch";
        }
        //if getdiscount is true
        if (getDiscount && currentDiscount) {
          discountId = await getDiscountID(
            currentDiscount.type,
            currentDiscount.value,
            tx
          );
        }
        // Create the new order using transaction context
        const newOrder = await tx.order.create({
          data: {
            userOrderId,
            modeOfPayment,
            orderType,
            billerName,
            totalCost: total,
            userId: user,
            paymentDetails,
            discountId,
            couponId,
          },
        });

        // Create order items and their addons using transaction context
        for (const item of validatedCart) {
          const orderItem = await tx.orderItems.create({
            data: {
              orderId: newOrder.id,
              iceCreamId: item.id,
              quantity: item.quantity,
              itemCost: item.cost,
            },
          });

          if (Array.isArray(item.addons)) {
            await Promise.all(
              item.addons.map((addon) =>
                tx.orderItemAddon.create({
                  data: {
                    quantity: addon.addonQuantity,
                    priceAtTime: addon.addonPrice,
                    orderId: orderItem.id,
                    addonId: addon.addonId,
                  },
                })
              )
            );
          }
        }
        if (kotActionState && kotid) {
          await deleteKOTorder(kotid, userId, tx);
        }
        return { userOrderId, kotSave };
      },
      {
        maxWait: 5000, // 5 seconds maximum wait time
        timeout: 10000, // 10 seconds timeout
      }
    );

    return {
      message: `${result.userOrderId},${result.kotSave}`,
      errors: {},
    };
  } catch (error) {
    console.log(error);
    return {
      message: `Failed to add the bill.Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      errors: {},
    };
  }
}

export async function getTopIcecreams(userId: string | undefined) {
  const result = createOrderSchema
    .pick({ userId: true })
    .safeParse({ userId: userId });

  if (!result.success) {
    throw new Error("User id validation failed");
  }
  const { userId: userIdVal } = result.data;
  try {
    const topIceCreams = await prisma.orderItems.groupBy({
      by: ["iceCreamId"],
      where: {
        order: {
          userId: userIdVal,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 7, // Limit to top 7 ice creams
    });
    const topIceCreamNamesWithQuantity = await Promise.all(
      topIceCreams.map(async (item) => {
        const iceCream = await prisma.iceCream.findUnique({
          where: {
            id: item.iceCreamId,
          },
          select: {
            name: true,
          },
        });
        return {
          name: iceCream?.name,
          quantity: item._sum.quantity,
        };
      })
    );

    // Log the result

    return topIceCreamNamesWithQuantity;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to get top icecreams.");
  }
}

//saledbydate

export async function getSalesByDate(
  startDate: string,
  endDate: string,
  userId: string | undefined
) {
  const result = dateRangeSchema.safeParse({
    startDate: startDate,
    endDate: endDate,
  });

  if (!result.success) {
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid dates");
  }
  const { startDate: start, endDate: end } = result.data;
  const dateRange = eachDayOfInterval({ start: start, end: end });

  const resultuser = createOrderSchema
    .pick({ userId: true })
    .safeParse({ userId: userId });

  if (!resultuser.success) {
    throw new Error("User Id Validation failed ");
  }
  const { userId: userIdVal } = resultuser.data;
  try {
    const ordersData = await prisma.order.findMany({
      where: {
        userId: userIdVal,
        orderDate: {
          gte: startOfDay(start),
          lte: endOfDay(end),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Process orders data
    const salesMap = new Map<string, number>();
    const quantityMap = new Map<string, number>();

    ordersData.forEach((order) => {
      const dateStr = format(order.orderDate, "yyyy-MM-dd");

      // Sum up total sales for this order
      const orderTotal = order.totalCost;
      salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + orderTotal);

      // Sum up total quantity for this order
      const orderQuantity = order.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      quantityMap.set(dateStr, (quantityMap.get(dateStr) || 0) + orderQuantity);
    });

    // Combine the data for all dates in the range
    const result: SalesDataEntry[] = dateRange.map((date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return {
        date: dateStr,
        totalSales: salesMap.get(dateStr) || 0,
        totalQuantity: quantityMap.get(dateStr) || 0,
      };
    });
    // console.log(result);
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch graph data.");
  }
}

//getReport

type ReportData = {
  detailedItems: DetailedOrderItem[];
  orders: Orders[];
};

export async function getReport(
  startDate: string,
  endDate: string,
  userId: string | undefined
): Promise<ReportData> {
  const result = dateRangeSchema.safeParse({
    startDate: startDate,
    endDate: endDate,
  });

  if (!result.success) {
    throw new Error("Invalid date");
  }
  const { startDate: start, endDate: end } = result.data;

  const resultuser = createOrderSchema
    .pick({ userId: true })
    .safeParse({ userId: userId });

  if (!resultuser.success) {
    throw new Error("User Id Validation failed ");
  }
  const { userId: userIdVal } = resultuser.data;
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userIdVal,
        orderDate: {
          gte: startOfDay(start),
          lte: endOfDay(end),
        },
      },
      select: {
        id: true,
        orderDate: true,
        modeOfPayment: true,
        orderType: true,
        billerName: true,
        paymentDetails: true,
        totalCost: true,
        discount: {
          select: {
            type: true,
            value: true,
          },
        },
        coupon: {
          select: {
            type: true,
            code: true,
            value: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            itemCost: true,
            addons: {
              select: {
                addonId: true,
                priceAtTime: true,
                quantity: true,
                addon: {
                  select: {
                    name: true,
                    category: true,
                  },
                },
              },
            },
            iceCream: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const ordersData: Orders[] = orders.map((order) => {
      // Calculate subtotal and check for addons
      const { subtotal, hasAddons } = order.orderItems.reduce(
        (acc, item) => {
          // Add icecream cost
          acc.subtotal += item.itemCost * item.quantity;

          // Calculate addons total and check if addons exist
          const itemAddonTotal = item.addons.reduce(
            (sum, addon) => sum + addon.priceAtTime * addon.quantity,
            0
          );

          acc.subtotal += itemAddonTotal;
          if (item.addons.length > 0) {
            acc.hasAddons = true;
          }

          return acc;
        },
        { subtotal: 0, hasAddons: false }
      );
      const gstRate = parseFloat(process.env.GST ?? "0.0");
      const totalAfterDiscount = order.totalCost;
      const gstAmount = totalAfterDiscount * gstRate;

      // Format payment details
      const paymentDetails =
        order.modeOfPayment === "PartPay" && order.paymentDetails
          ? `Cash: ${
              (
                order.paymentDetails as {
                  UPI?: number;
                  Card?: number;
                  Cash?: number;
                }
              ).Cash || 0
            }, UPI: ${
              (
                order.paymentDetails as {
                  UPI?: number;
                  Card?: number;
                  Cash?: number;
                }
              ).UPI || 0
            }, Card: ${
              (
                order.paymentDetails as {
                  UPI?: number;
                  Card?: number;
                  Cash?: number;
                }
              ).Card || 0
            }`
          : "-";

      return {
        Date: order.orderDate,
        "Order ID": order.id,
        "Mode of Payment": order.modeOfPayment,
        "Payment Details": paymentDetails,
        "Order Type": order.orderType,
        "Biller Name": order.billerName,
        Branch: order.user.username,
        "Ice Creams": order.orderItems
          .map((icecream) => `${icecream.iceCream.name} (${icecream.quantity})`)
          .join("; "),
        "Has Addons": hasAddons ? "Yes" : "No",
        "Sub Total": subtotal,
        Discount: order.discount
          ? `${
              order.discount.type === "FLAT"
                ? `₹${order.discount.value}`
                : `${order.discount.value}%`
            }`
          : "-",
        Coupon: order.coupon
          ? `${order.coupon.value}${
              order.coupon.type === "FLAT" ? "₹" : "%"
            } (${order.coupon.code})`
          : "-",
        "Total After Discount": totalAfterDiscount,
        "GST Rate": gstRate,
        "GST Amount": gstAmount,
        "Final Total": totalAfterDiscount + gstAmount,
      };
    });

    const detailedOrderItems: DetailedOrderItem[] = orders.flatMap((order) =>
      order.orderItems.map((item) => {
        // Calculate addon total
        const addonTotal = item.addons.reduce(
          (sum, addon) => sum + addon.priceAtTime * addon.quantity,
          0
        );

        // Calculate subtotal
        const subtotal = item.itemCost * item.quantity + addonTotal;

        // Calculate discount amount
        let discountAmount = 0;
        if (order.discount) {
          discountAmount =
            order.discount.type === "FLAT"
              ? order.discount.value
              : (subtotal * order.discount.value) / 100;
        } else if (order.coupon) {
          discountAmount =
            order.coupon.type === "FLAT"
              ? order.coupon.value
              : (subtotal * order.coupon.value) / 100;
        }

        // Format discount/coupon information
        let discountInfo = "";
        if (order.discount) {
          discountInfo = `${
            order.discount.type === "FLAT"
              ? `₹${order.discount.value}`
              : `${order.discount.value}%`
          }`;
        }
        let couponInfo = "-";
        if (order.coupon?.code) {
          couponInfo = `${order.coupon.value}${
            order.coupon.type === "FLAT" ? "₹" : "%"
          } (${order.coupon.code})`;
        }

        return {
          date: order.orderDate,
          orderId: order.id,
          modeOfPayment: order.modeOfPayment,
          orderType: order.orderType,
          username: order.user.username,
          billerName: order.billerName,
          iceCreamName: item.iceCream.name,
          cost: item.itemCost,
          quantity: item.quantity,
          addonTotal: addonTotal,
          subtotal: subtotal,
          discount: discountInfo || "-",
          coupon: couponInfo,
          finalTotal: subtotal - discountAmount,
          category: item.iceCream.category.name,

          addons: item.addons.map((addon) => ({
            id: addon.addonId,
            priceAtTime: addon.priceAtTime,
            quantity: addon.quantity,
            addon: {
              name: addon.addon.name,
              category: addon.addon.category,
            },
          })),
        };
      })
    );
    // console.log(detailedOrderItems);
    return {
      detailedItems: detailedOrderItems,
      orders: ordersData,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Detailed Order Items.");
  }
}

//todaySales
export async function getTodaySalesGroupedByPayment(
  userId: string | undefined
) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        userId: userId ? parseInt(userId) : undefined,
        orderDate: {
          gte: today,
        },
        status: "SUCCESS",
      },
      select: {
        modeOfPayment: true,
        totalCost: true,
        paymentDetails: true,
      },
    });

    // Initialize payment totals
    const paymentTotals = {
      UPI: 0,
      Card: 0,
      Cash: 0,
    };

    // Process each order
    orders.forEach((order) => {
      if (order.modeOfPayment === "PartPay" && order.paymentDetails) {
        // For PartPay, parse the JSON and add to respective totals
        const details = order.paymentDetails as {
          UPI?: number;
          Card?: number;
          Cash?: number;
        };

        paymentTotals.UPI += details.UPI || 0;
        paymentTotals.Card += details.Card || 0;
        paymentTotals.Cash += details.Cash || 0;
      } else {
        // For direct payments, add the total to the respective mode
        if (order.modeOfPayment === "UPI") {
          paymentTotals.UPI += order.totalCost;
        } else if (order.modeOfPayment === "Card") {
          paymentTotals.Card += order.totalCost;
        } else if (order.modeOfPayment === "Cash") {
          paymentTotals.Cash += order.totalCost;
        }
      }
    });

    // Convert to the format expected by the Card component
    return Object.entries(paymentTotals)
      .map(([modeOfPayment, totalSales]) => ({
        modeOfPayment,
        totalSales,
      }))
      .filter((item) => item.totalSales > 0); // Optionally filter out zero values
  } catch (error) {
    console.error("Failed to fetch today's sales:", error);
    throw new Error("Failed to fetch today's sales data");
  }
}
//kot order creation

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface CounterResponse {
  kotCounter: number;
  orderCounter?: number;
}

interface UpdateData {
  KOTCounter: number | { increment: number };
  lastUpdated: Date;
  counter?: { increment: number };
}

export async function updateKOTCounter(
  userId: string,
  billUpdate: false,
  tx: TransactionClient
): Promise<number>;
export async function updateKOTCounter(
  userId: string,
  billUpdate: true,
  tx: TransactionClient
): Promise<CounterResponse>;
export async function updateKOTCounter(
  userId: string,
  billUpdate: boolean = false,
  tx: TransactionClient
): Promise<number | CounterResponse> {
  console.log("executing from actions");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of the day

  const userCounter = await tx.userOrderCounter.findUnique({
    where: { loginId: parseInt(userId) },
  });

  // Check if we need to reset the counter for a new day
  if (
    !userCounter ||
    !userCounter.lastUpdated ||
    userCounter.lastUpdated < today
  ) {
    // Reset KOT counter to 1 for a new day
    const updateData: UpdateData = {
      KOTCounter: 1,
      lastUpdated: new Date(),
    };

    // If billUpdate is true, also increment the counter
    if (billUpdate) {
      updateData.counter = { increment: 1 };
    }

    const updatedCounter = await tx.userOrderCounter.update({
      where: { loginId: parseInt(userId) },
      data: updateData,
      select: {
        KOTCounter: true,
        ...(billUpdate && { counter: true }),
      },
    });

    return billUpdate
      ? {
          kotCounter: updatedCounter.KOTCounter,
          orderCounter: updatedCounter.counter,
        }
      : updatedCounter.KOTCounter;
  } else {
    // Increment the existing KOT counter
    const updateData: UpdateData = {
      KOTCounter: { increment: 1 },
      lastUpdated: new Date(),
    };

    // If billUpdate is true, also increment the counter
    if (billUpdate) {
      updateData.counter = { increment: 1 };
    }

    const updatedCounter = await tx.userOrderCounter.update({
      where: { loginId: parseInt(userId) },
      data: updateData,
      select: {
        KOTCounter: true,
        ...(billUpdate && { counter: true }),
      },
    });

    return billUpdate
      ? {
          kotCounter: updatedCounter.KOTCounter,
          orderCounter: updatedCounter.counter,
        }
      : updatedCounter.KOTCounter;
  }
}

export async function createKOTBill(
  cart: CartItem[][],
  totalCost: number,
  userId: string | undefined,
  kotName: string
) {
  if (!userId) {
    return { message: "User ID is required", kotNum: undefined };
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        // Get updated counter within transaction using base function
        const updatedCounter = await updateKOTCounter(userId, false, tx);

        // Create the new order within the same transaction
        const newOrder = await tx.kOTOrder.create({
          data: {
            kotNumber: updatedCounter,
            kotName: kotName,
            total: totalCost,
            loginId: parseInt(userId),
            cartItems: JSON.stringify(cart),
          },
          select: {
            kotNumber: true,
          },
        });

        return {
          message: "KOT Bill Added",
          kotNum: newOrder.kotNumber,
        };
      },
      {
        maxWait: 5000, // 5 seconds maximum wait time
        timeout: 10000, // 10 seconds timeout
      }
    );
  } catch (error) {
    console.error("Error creating KOT bill:", error);
    return {
      message: "Failed to add the KOTbill.",
      kotNum: undefined,
    };
  }
}
//fetchKOT orders

export async function getKOTData(userId: string | undefined) {
  console.log("kot data fetched");
  try {
    if (!userId || isNaN(parseInt(userId))) {
      throw new Error("Invalid or missing user ID");
    }
    const kotOrders = await prisma.kOTOrder.findMany({
      where: { loginId: parseInt(userId) },
      select: {
        id: true,
        kotNumber: true,
        kotName: true,
        cartItems: true,
        total: true,
        lastUpdatedDate: true,
      },
    });

    return {
      success: true,
      data: kotOrders,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      data: [],
    };
  }
}

export async function deleteKOTorder(
  kotid: number | undefined,
  userId: string | undefined,
  tx?: TransactionClient
) {
  console.log("deleting kot");
  const prismaClient = tx || prisma;
  if (kotid === undefined) {
    throw new Error("KOT ID is required.");
  }
  if (typeof kotid === "string") {
    kotid = parseInt(kotid);
  }
  if (!userId) {
    return { message: "User ID is required", kotNum: undefined };
  }
  try {
    await prismaClient.kOTOrder.delete({
      where: {
        loginId: parseInt(userId),
        id: kotid,
      },
    });
    return { success: true };
  } catch {
    throw new Error("Failed to delete from KOT.");
  }
}

//append
export async function appendKOTorder(
  kotid: number | undefined,
  updatedCart: CartItem[],
  totalCost: number,
  userId: string | undefined
) {
  if (kotid === undefined) {
    throw new Error("KOT ID is required.");
  }
  if (!userId) {
    return { message: "User ID is required", kotNum: undefined };
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const parsedKotId = typeof kotid === "string" ? parseInt(kotid) : kotid;

        const existingKOTOrder = await tx.kOTOrder.findUnique({
          where: { loginId: parseInt(userId), id: parsedKotId },
          select: { cartItems: true, total: true },
        });

        if (!existingKOTOrder) {
          throw new Error(`KOTOrder with ID ${parsedKotId} not found.`);
        }

        const updatedCounter = await updateKOTCounter(userId, false, tx);

        if (typeof existingKOTOrder.cartItems !== "string") {
          throw new Error("Invalid cart items format");
        }

        const jitem = JSON.parse(existingKOTOrder.cartItems);
        jitem.push(updatedCart);

        const updatedKOTOrder = await tx.kOTOrder.update({
          where: { loginId: parseInt(userId), id: parsedKotId },
          data: {
            kotNumber: updatedCounter,
            cartItems: JSON.stringify(jitem),
            total: existingKOTOrder.total + totalCost,
          },
          select: {
            kotNumber: true,
          },
        });

        return {
          message: "KOT Bill appended",
          kotNum: updatedKOTOrder.kotNumber,
        };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error("Error appending KOT order:", error);
    return {
      message: `Failed to append the KOT bill. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      kotNum: undefined,
    };
  }
}

export async function editKOTorder(
  kotid: number | undefined,
  updatedCart: CartItem[],
  totalCost: number,
  userId: string | undefined
) {
  if (kotid === undefined) {
    throw new Error("KOT ID is required.");
  }
  if (typeof kotid === "string") {
    kotid = parseInt(kotid);
  }
  if (!userId) {
    return { message: "User ID is required", kotNum: undefined };
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        // Retrieve the current KOTOrder using transaction context
        const existingKOTOrder = await tx.kOTOrder.findUnique({
          where: { loginId: parseInt(userId), id: kotid },
          select: { cartItems: true, total: true },
        });

        if (!existingKOTOrder) {
          throw new Error(`KOTOrder with ID ${kotid} not found.`);
        }

        // Get updated counter within transaction
        const updatedCounter = await updateKOTCounter(userId, false, tx);
        const cartItemsArray = existingKOTOrder.cartItems;

        if (typeof cartItemsArray === "string") {
          const jitem = JSON.parse(cartItemsArray);
          let lasttotal = 0;

          if (jitem.length > 0) {
            const lastItem = jitem[jitem.length - 1];
            lasttotal = lastItem.reduce(
              (acc: number, item: CartItem) => acc + item.cost * item.quantity,
              0
            );
            jitem[jitem.length - 1] = updatedCart;
          }

          const finaltotal = existingKOTOrder.total + totalCost - lasttotal;

          const updatedKOTOrder = await tx.kOTOrder.update({
            where: { loginId: parseInt(userId), id: kotid },
            data: {
              kotNumber: updatedCounter,
              cartItems: JSON.stringify(jitem),
              total: finaltotal,
            },
            select: {
              kotNumber: true,
            },
          });

          return {
            message: "KOT Bill edited",
            kotNum: updatedKOTOrder.kotNumber,
          };
        }

        throw new Error("Invalid cart items format");
      },
      {
        maxWait: 5000, // 5 seconds maximum wait time
        timeout: 10000, // 10 seconds timeout
      }
    );
  } catch (error) {
    console.error("Error editing KOT order:", error);
    return {
      message: `Failed to edit the KOTbill.Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      kotNum: undefined,
    };
  }
}

export async function cancelBill(
  billNumber: string,
  userId: string | undefined
) {
  if (!userId) {
    return { message: "User ID is required", kotNum: undefined };
  }
  try {
    const result = await prisma.order.updateMany({
      where: {
        userId: parseInt(userId),
        userOrderId: parseInt(billNumber),
      },
      data: {
        status: "CANCELLED",
      },
    });
    if (result.count === 0) {
      return {
        success: false,
        message: "Bill number doesnt exist",
      };
    }

    return {
      success: true,
      message: "Bill Cancelled Successfully",
    };
  } catch {
    return {
      success: false,
      message: "Bill Cancellation Failed",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCategories() {
  try {
    console.log("catgeors fetched");
    const categories: {
      id: number;
      name: string;
    }[] = await prisma.category.findMany({});
    categories.sort((a, b) => {
      const aStartsWithI = a.name.startsWith("I") ? 0 : 1;
      const bStartsWithI = b.name.startsWith("I") ? 0 : 1;
      return aStartsWithI - bStartsWithI || a.name.localeCompare(b.name);
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      data: [],
    };
  }
}

export async function addCategory(name: string) {
  try {
    await prisma.category.create({
      data: {
        name,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

export async function updateCategory(id: number, name: string) {
  try {
    await prisma.category.update({
      where: { id },
      data: { name },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

//email
export async function getEmail(userId: string | undefined) {
  if (!userId) {
    return null;
  }
  const id = parseInt(userId as string, 10); // Convert userId to a number
  if (isNaN(id)) {
    throw new Error("Invalid User ID");
  }

  // Prisma query to fetch email
  const user = await prisma.login.findUnique({
    where: { id },
    select: { email: true },
  });

  return user?.email || null; // Return email or null if user not found
}

export async function updateEmail(userId: string | undefined, email: string) {
  if (!userId) {
    return null;
  }
  const id = parseInt(userId as string, 10); // Convert userId to a number
  if (isNaN(id)) {
    throw new Error("Invalid User ID");
  }
  try {
    await prisma.login.update({
      where: { id },
      data: { email },
    });
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

export async function getRecentOrders(userId: string | undefined) {
  const result = createOrderSchema
    .pick({ userId: true })
    .safeParse({ userId: userId });

  if (!result.success) {
    throw new Error("User id validation failed");
  }

  const { userId: userIdVal } = result.data;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const recentOrders = await prisma.order.findMany({
      where: {
        userId: userIdVal,
        status: "SUCCESS",
        orderDate: {
          gte: new Date(todayStr),
          lt: new Date(new Date(todayStr).setDate(today.getDate() + 1)),
        },
      },
      select: {
        id: true,
        userOrderId: true,
        orderDate: true,
        modeOfPayment: true,
        orderType: true,
        totalCost: true,
        paymentDetails: true,
        discount: {
          select: {
            type: true,
            value: true,
          },
        },
        coupon: {
          select: {
            type: true,
            value: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            itemCost: true,
            iceCream: {
              select: {
                name: true,
              },
            },
            addons: {
              select: {
                quantity: true,
                priceAtTime: true,
                addon: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    return recentOrders;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch recent orders.");
  }
}

export async function updatePaymentMode(
  orderId: number,
  userId: string | undefined,
  newPaymentMode: ModeOfPayment,
  paymentDetails?: { Cash: number; UPI: number; Card: number }
) {
  try {
    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const updateData = {
      modeOfPayment: newPaymentMode,
      paymentDetails:
        newPaymentMode === "PartPay" && paymentDetails
          ? paymentDetails
          : { set: null },
    };
    await prisma.order.update({
      where: {
        id: orderId,
        userId: parseInt(userId),
      },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update payment mode:", error);
    return { success: false, message: "Failed to update payment mode" };
  }
}
export async function encrypt(text: string) {
  const iv = crypto.randomBytes(16); // IV must be 16 bytes

  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("Missing ENCRYPTION_KEY in environment variables");
  }

  const key = Buffer.from(keyHex, "hex"); // Convert from hex to Buffer

  if (key.length !== 32) {
    throw new Error(`Invalid key length: ${key.length}. Expected 32 bytes.`);
  }

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export async function decrypt(text: string) {
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("Missing ENCRYPTION_KEY in environment variables");
  }

  const key = Buffer.from(keyHex, "hex");

  if (key.length !== 32) {
    throw new Error(`Invalid key length: ${key.length}. Expected 32 bytes.`);
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export async function createEmployee(
  prevState: EmployeeState,
  formData: FormData
) {
  console.log("creating empyye");
  const validatedFields = createEmployeeSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
    phoneNumber: formData.get("phoneNumber"),
    loginId: Number(formData.get("loginId")),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields",
    } as EmployeeState;
  }

  const { name, password, phoneNumber, loginId } = validatedFields.data;
  const encryptedPassword = await encrypt(password);

  try {
    await prisma.employee.create({
      data: {
        name,
        password: encryptedPassword,
        phoneNumber,
        loginId,
      },
    });

    return {
      message: "Employee created successfully",
    } as EmployeeState;
  } catch (error) {
    console.error("Error creating employee:", error);
    return {
      errors: {
        _form: ["Failed to create employee"],
      },
      message: "Failed to create employee",
    } as EmployeeState;
  }
}

export async function getEmployees(loginId: number) {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        loginId: loginId,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        password: true,
      },
    });

    const decryptedEmployees = await Promise.all(
      employees.map(async (emp) => ({
        ...emp,
        password: await decrypt(emp.password), // ✅ Waits for decryption
      }))
    );

    return decryptedEmployees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
}
export async function updateEmployee(employeeId: number, formData: FormData) {
  const validatedFields = editEmployeeSchema.safeParse({
    name: formData.get("name"),
    phoneNumber: formData.get("phoneNumber"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Failure",
    };
  }

  const { name, phoneNumber } = validatedFields.data;

  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name,
        phoneNumber,
      },
    });

    revalidatePath("/admin");
    return { message: "Employee updated successfully" };
  } catch {
    return {
      message: "Database Error: Failed to update employee.",
    };
  }
}

export async function resetEmployeePassword(
  employeeId: number,
  formData: FormData
) {
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to reset password",
    };
  }

  const { password } = validatedFields.data;
  const encryptedPassword = await encrypt(password);

  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        password: encryptedPassword,
      },
    });

    revalidatePath("/admin");
    return { message: "Password reset successfully" };
  } catch {
    return {
      message: "Database Error: Failed to reset password.",
    };
  }
}

export async function deleteEmployee(employeeId: number) {
  try {
    await prisma.employee.delete({
      where: { id: employeeId },
    });

    revalidatePath("/admin");
    return { message: "Employee deleted successfully" };
  } catch {
    return {
      message: "Database Error: Failed to delete employee.",
    };
  }
}
type IceCreamInputa = {
  name: string;
  categoryId: number;
  cost: number;
  loginId: number;
};
export async function insertIceCreams(iceCreams: IceCreamInputa[]) {
  try {
    await prisma.iceCream.createMany({
      data: iceCreams,
    });

    revalidatePath("/admin/ice-creams");
    return { success: true, message: "Ice creams inserted successfully!" };
  } catch (error) {
    console.error("Failed to insert ice creams:", error);
    return { success: false, message: "Failed to insert ice creams." };
  }
}

export async function validateCoupon(userId: string, couponCode: string) {
  try {
    // Validate input
    if (!couponCode) {
      throw new Error("Coupon Code are required");
    }

    // Find the coupon for the specific login
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        loginId: parseInt(userId),
      },
    });

    // Check if coupon exists
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Check expiry date
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new Error("Coupon has expired");
    }

    // Check max usage
    if (coupon.maxUsage !== null && coupon.maxUsage <= 0) {
      throw new Error("Coupon has reached its maximum usage limit");
    }

    // Update the coupon's max usage
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        maxUsage: coupon.maxUsage !== null ? coupon.maxUsage - 1 : null,
      },
    });

    // Return coupon details
    return {
      couponId: coupon.id,
      type: coupon.type,
      value: coupon.value,
    };
  } catch (error) {
    // Log the error for server-side tracking
    console.error("Coupon Validation Error:", error);

    // Throw a specific error message
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    // Fallback error message
    throw new Error("An unexpected error occurred during coupon validation");
  }
}

export async function createCoupon(formData: {
  code: string;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  maxUsage?: number;
  expiryDate?: Date;
  loginId: number;
}) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        ...formData,
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate)
          : undefined,
      },
    });

    revalidatePath("/coupons");
    return { success: true, coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function updateCoupon(
  id: number,
  formData: {
    code?: string;
    type?: "PERCENTAGE" | "FLAT";
    value?: number;
    maxUsage?: number;
    expiryDate?: Date;
  }
) {
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...formData,
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate)
          : undefined,
      },
    });

    revalidatePath("/coupons");
    return { success: true, coupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

export async function deleteCoupon(id: number) {
  try {
    await prisma.coupon.delete({
      where: { id },
    });

    revalidatePath("/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

export async function getCoupons(userId: string) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { loginId: parseInt(userId) },
      orderBy: { expiryDate: "desc" },
    });
    return coupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

export async function getPreviousDaySalesGroupedByPayment(
  userId: string | undefined
) {
  try {
    // Get IST date for yesterday
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Get yesterday's start and end in IST
    const yesterdayStart = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(today.getTime());

    const orders = await prisma.order.findMany({
      where: {
        userId: userId ? parseInt(userId) : undefined,
        orderDate: {
          gte: yesterdayStart,
          lt: yesterdayEnd,
        },
        status: "SUCCESS",
      },
      select: {
        modeOfPayment: true,
        totalCost: true,
        paymentDetails: true,
      },
    });

    // Rest of the logic remains same as getTodaySalesGroupedByPayment
    const paymentTotals = {
      UPI: 0,
      Card: 0,
      Cash: 0,
    };

    orders.forEach((order) => {
      if (order.modeOfPayment === "PartPay" && order.paymentDetails) {
        const details = order.paymentDetails as {
          UPI?: number;
          Card?: number;
          Cash?: number;
        };

        paymentTotals.UPI += details.UPI || 0;
        paymentTotals.Card += details.Card || 0;
        paymentTotals.Cash += details.Cash || 0;
      } else {
        if (order.modeOfPayment === "UPI") {
          paymentTotals.UPI += order.totalCost;
        } else if (order.modeOfPayment === "Card") {
          paymentTotals.Card += order.totalCost;
        } else if (order.modeOfPayment === "Cash") {
          paymentTotals.Cash += order.totalCost;
        }
      }
    });

    return Object.entries(paymentTotals)
      .map(([modeOfPayment, totalSales]) => ({
        modeOfPayment,
        totalSales,
      }))
      .filter((item) => item.totalSales > 0);
  } catch (error) {
    console.error("Failed to fetch yesterday's sales:", error);
    throw new Error("Failed to fetch yesterday's sales data");
  }
}

export async function getUserProfile(userId: number) {
  try {
    const user = await prisma.login.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        address: true,
        gstNumber: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}
export async function updateUserProfile(userId: number, formData: FormData) {
  try {
    // Extract and validate data
    const validatedData = updateProfile.parse({
      email: formData.get("email"),
      username: formData.get("username"),
      address: formData.get("address") || null,
      gstNumber: formData.get("gstNumber") || null,
    });

    // Check if username is already taken by another user
    if (validatedData.username) {
      const existingUser = await prisma.login.findFirst({
        where: {
          username: validatedData.username,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return {
          success: false,
          message: "Username is already taken",
        };
      }
    }

    // Update user profile
    await prisma.login.update({
      where: {
        id: userId,
      },
      data: {
        email: validatedData.email,
        username: validatedData.username,
        address: validatedData.address,
        gstNumber: validatedData.gstNumber,
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}

/**
 * Reset user password
 */
export async function resetUserPassword(userId: number, formData: FormData) {
  const validationSchema = z
    .object({
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  try {
    // Extract and validate data
    const validatedData = validationSchema.parse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    // Hash the password
    const encryptedPassword = await encrypt(validatedData.password);

    // Update user password
    await prisma.login.update({
      where: {
        id: userId,
      },
      data: {
        password: encryptedPassword,
      },
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Error resetting user password:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: false,
      message: "Failed to reset password",
    };
  }
}

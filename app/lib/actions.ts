"use server";
import {
  createIceCreamSchema,
  registerUserSchema,
  createOrderSchema,
  dateRangeSchema,
  CreateIcecream,
  createAddonSchema,
  CreateAddon,
} from "../validation_schemas";
import { startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns";
import { AddonCategory, PrismaClient, ModeOfPayment } from "@prisma/client";
import { CartItem } from "@/context/CartContext";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
const prisma = new PrismaClient();

import { redirect } from "next/navigation";

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

export interface SalesDataEntry {
  date: string;
  totalSales: number;
  totalQuantity: number;
}
export interface DetailedOrderItem {
  date: Date;
  orderId: number;
  modeOfPayment: string;
  orderType: string;
  username: string;
  iceCreamName: string;
  cost: number;
  quantity: number;
  category: string;
  addons: {
    id: number;
    priceAtTime: number;
    quantity: number;
    addon: {
      name: string;

      category: string;
    };
  }[];
}

export interface RecentOrder {
  id: number;
  userOrderId: number;
  orderDate: Date;
  modeOfPayment: string;
  orderType: string;
  totalCost: number;
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

export async function createIcecream(prevState: State, formData: FormData) {
  console.log("formData is", formData);
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
    // Create a new ice cream entry in the database
    await prisma.iceCream.create({
      data: {
        name,
        categoryId: categoryId,
        cost,
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
  userId: string,
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
export async function createAddon(prevState: AddonState, formData: FormData) {
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
  userId: string,
  prevState: AddonState,
  formData: FormData
) {
  // const iceCreamInKOT = await searchKOT(id, userId, "addon");
  // if (iceCreamInKOT) {
  //   return {
  //     message: "Item in KOT. Please clear the KOT before Updating.",
  //     errors: {},
  //   };
  // }
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
export async function getIceCreamData() {
  try {
    // await delay(500);
    console.log("icecreams fetched");
    const iceCreams: CreateIcecream[] = await prisma.iceCream.findMany({
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
export async function getAdonsData() {
  try {
    console.log("addons fetched");
    const addons: CreateAddon[] = await prisma.addon.findMany({
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
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { email, username, password } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // Create a new ice cream entry in the database
    await prisma.login.create({
      data: {
        email,
        username,
        password: hashedPassword,
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
      message: "Successfully Regsitered",
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
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

//billing
export async function createBill(
  cart: CartItem[],
  totalCost: number,
  userId: string | undefined,
  prevState: BillState,
  formData: FormData,
  kotActionState: string | undefined,
  kotid: number | undefined
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

        // Create the new order using transaction context
        const newOrder = await tx.order.create({
          data: {
            userOrderId,
            modeOfPayment,
            orderType,
            totalCost: total,
            userId: user,
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

export async function getReport(
  startDate: string,
  endDate: string,
  userId: string | undefined
) {
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

    const detailedOrderItems: DetailedOrderItem[] = orders.flatMap((order) =>
      order.orderItems.map((item) => ({
        date: order.orderDate,
        orderId: order.id,
        modeOfPayment: order.modeOfPayment,
        orderType: order.orderType,
        username: order.user.username,
        iceCreamName: item.iceCream.name,
        cost: item.itemCost,
        quantity: item.quantity,
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
      }))
    );
    // console.log(detailedOrderItems);
    return detailedOrderItems;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Detailed Order Items.");
  }
}

//todaySales
export async function getTodaySalesGroupedByPayment(
  userId: string | undefined
) {
  const resultuser = createOrderSchema
    .pick({ userId: true })
    .safeParse({ userId: userId });

  if (!resultuser.success) {
    throw new Error("User Id Validation failed ");
  }

  const { userId: userIdVal } = resultuser.data;
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  try {
    const result = await prisma.order.groupBy({
      by: ["modeOfPayment"],
      _sum: {
        totalCost: true,
      },
      where: {
        userId: userIdVal,
        orderDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "SUCCESS", // Only count successful orders
      },
    });

    const groupedSales = result.map((group) => ({
      modeOfPayment: group.modeOfPayment,
      totalSales: group._sum.totalCost || 0,
    }));

    return groupedSales;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch today's sales grouped by payment mode.");
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
    const recentOrders = await prisma.order.findMany({
      where: {
        userId: userIdVal,
        status: "SUCCESS",
      },
      select: {
        id: true,
        userOrderId: true,
        orderDate: true,
        modeOfPayment: true,
        orderType: true,
        totalCost: true,
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
        orderDate: "desc", // Most recent orders first
      },
      take: 20, // Limit to last 20 orders
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
  newPaymentMode: ModeOfPayment
) {
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }

  try {
    await prisma.order.update({
      where: {
        id: orderId,
        userId: parseInt(userId),
      },
      data: {
        modeOfPayment: newPaymentMode,
      },
    });

    return {
      success: true,
      message: "Payment mode updated successfully",
    };
  } catch (error) {
    console.error("Failed to update payment mode:", error);
    return {
      success: false,
      message: "Failed to update payment mode",
    };
  }
}

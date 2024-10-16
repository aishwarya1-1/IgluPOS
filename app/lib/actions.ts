"use server";
import {
  createIceCreamSchema,
  registerUserSchema,
  createOrderSchema,
  dateRangeSchema,
} from "../validation_schemas";
import { startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { CartItem, useCart } from "@/context/CartContext";
import { IceCream } from "@/context/CartContext";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
const prisma = new PrismaClient();
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export type State = {
  errors?: {
    name?: string[];
    category?: string[];
    cost?: string[];
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
}

export async function createIcecream(prevState: State, formData: FormData) {
  const validatedFields = createIceCreamSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    cost: formData.get("cost"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { name, category, cost } = validatedFields.data;
  console.log(name, category, cost);
  try {
    // Create a new ice cream entry in the database
    const newIceCream = await prisma.iceCream.create({
      data: {
        name,
        category,
        cost,
      },
    });
    revalidatePath("/billing");
    return {
      message: "Ice cream added successfully",
      errors: {},
    };
  } catch (error) {
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
    category: formData.get("category"),
    cost: formData.get("cost"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { name, category, cost } = validatedFields.data;
  console.log(name, category, cost);
  try {
    const updatedIceCream = await prisma.iceCream.update({
      where: {
        id: id, // Specify the id of the ice cream to update
      },
      data: {
        name: name, // Update the name
        category: category, // Update the category
        cost: cost, // Update the cost
      },
    });
    revalidatePath("/billing");
  } catch (error) {
    return {
      message: "Failed to Update Ice Cream.",
      errors: {},
    };
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
  redirect("/billing");
}

//getIcecream
export async function getIceCreamData() {
  try {
    await delay(500);
    const iceCreams: IceCream[] = await prisma.iceCream.findMany({
      select: {
        id: true,
        name: true,
        cost: true,
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

export async function getIceCreamById(id: number) {
  try {
    const iceCream = await prisma.iceCream.findUnique({
      where: {
        id: id, // Use the provided id to find the ice cream
      },
      select: {
        id: true,
        name: true,
        category: true, // Assuming you have a category field in your iceCream model
        cost: true, // Assuming "cost" is the price column in your schema
      },
    });

    if (!iceCream) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: iceCream,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      data: null,
    };
  }
}

export async function deleteIceCreamById(id: number) {
  try {
    // This is the command that tells Prisma to delete the ice cream based on its ID.
    const deletedIceCream = await prisma.iceCream.delete({
      where: {
        id: id, // Specify the id of the ice cream you want to delete
      },
    });

    revalidatePath("/billing");
  } catch (error) {
    console.error(`Failed to delete ice cream with ID ${id}:`, error);
    return {
      success: false,
    };
  }
  redirect("/billing");
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

  console.log(email, username, password);
  console.log("database");
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // Create a new ice cream entry in the database
    const newIceCream = await prisma.login.create({
      data: {
        email,
        username,
        password: hashedPassword,
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
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//billing
export async function createBill(
  cart: CartItem[],
  totalCost: number,
  userId: string | undefined,
  prevState: BillState,
  formData: FormData
) {
  const validatedFields = createOrderSchema.safeParse({
    cart: cart,
    modeOfPayment: formData.get("modeOfPayment"),
    orderType: formData.get("orderType"),
    totalCost: totalCost,
    userId: userId,
  });
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
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
  // console.log(validatedCart, modeOfPayment, orderType, total, user);
  try {
    await prisma.$transaction(async (prisma) => {
      // Create the new order
      const newOrder = await prisma.order.create({
        data: {
          modeOfPayment,
          orderType,
          totalCost: total,
          userId: user,
        },
      });

      await prisma.orderItems.createMany({
        data: validatedCart.map((item) => ({
          orderId: newOrder.id,
          iceCreamId: item.id,
          quantity: item.quantity,
          itemCost: item.cost,
        })),
      });
    });
    console.log("Done");
    revalidatePath("/billing/dashboard");

    return {
      message: "Bill Added",
      errors: {},
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Failed to add the bill.",
      errors: {},
    };
  } finally {
    await prisma.$disconnect();
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
  // console.log(start, end, dateRange);
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
            iceCream: {
              select: {
                name: true,
                category: true,
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
        category: item.iceCream.category,
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
export async function getTodaySales(userId: string | undefined) {
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
    const result = await prisma.order.aggregate({
      _sum: {
        totalCost: true,
      },
      where: {
        userId: userIdVal,
        orderDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const totalSalesSum = result._sum.totalCost || 0; // Default to 0 if no orders
    return totalSalesSum;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch todays sales.");
  }
}

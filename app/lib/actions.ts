"use server";
import {
  createIceCreamSchema,
  registerUserSchema,
} from "../validation_schemas";
import { PrismaClient } from "@prisma/client";
import { IceCream } from "@/context/CartContext";
import bcrypt from "bcryptjs";

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
    const iceCreams: IceCream[] = await prisma.iceCream.findMany({
      select: {
        id: true,
        name: true,
        cost: true, // Assuming "cost" is the price column in your schema
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
      revalidateTag: `iceCream-${id}`,
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

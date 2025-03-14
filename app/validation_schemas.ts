import { z } from "zod";

export const createIceCreamSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  categoryId: z.coerce
    .number({
      required_error: "Please select a category.",
    })
    .min(1, { message: "Please select a valid category." }),

  cost: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than Rs0." }),
});

export const createAddonSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  category: z.string().nonempty({ message: "Category is required" }),
  price: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than Rs0." }),
});

export const registerUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),

  username: z.string().nonempty("Username is required"),

  password: z.string().nonempty("Password is required"),
  address: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .nonempty("Store address is required"),

  gstNumber: z.string().nonempty("GST number is required"),
});

const AddonItemSchema = z.object({
  addonId: z.number(),
  addonName: z.string(),
  addonPrice: z.number(),
  addonQuantity: z.number(),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),

  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  loginId: z.number(),
});

const CartItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  cost: z.number(),
  quantity: z.number(),
  addons: z.array(AddonItemSchema).optional(),
});

export const createOrderSchema = z.object({
  cart: z
    .array(CartItemSchema)
    .nonempty({ message: "At least one ice cream must be selected." }),
  orderType: z.enum(["DineIn", "TakeAway", "Delivery"], {
    message: "Please select the Order Type",
  }),
  modeOfPayment: z.enum(["Cash", "Card", "UPI", "PartPay"], {
    message: "Please select a payment method.",
  }),
  userId: z.coerce.number(),
  totalCost: z.number(),
});

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in the format YYYY-MM-DD")
  .refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid date",
  })
  .transform((date) => new Date(date));

export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createIceCreamSchemaWithId = createIceCreamSchema.extend({
  id: z.number(),
  category: z.object({
    name: z.string(),
  }), // Add the id field of type number
});

// Now infer the type
export type CreateIcecream = z.infer<typeof createIceCreamSchemaWithId>;

export type CartItemSchemaType = z.infer<typeof CartItemSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createAddonSchemaWithId = createAddonSchema.extend({
  id: z.number(),
});

export type CreateAddon = z.infer<typeof createAddonSchemaWithId>;

export type editIceCream = {
  id: number;
  name: string;
  category: string;
  cost: number;
};
export const editEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});

// Validation schema for password reset
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateProfile = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

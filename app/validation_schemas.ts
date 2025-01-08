import { z } from "zod";

export const createIceCreamSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  category: z.enum(["IceCream", "Falooda", "MilkShakes", "Topping", "Cone"], {
    message: "Please Select a Category .",
  }),
  cost: z.coerce
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
});

const AddonItemSchema = z.object({
  addonName: z.string(),
  addonPrice: z.number(),
  addonQuantity: z.number(),
});

const AddonsSchema = z.object({
  cone: z.array(AddonItemSchema),
  topping: z.array(AddonItemSchema),
});

const CartItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  cost: z.number(),
  quantity: z.number(),
  addons: AddonsSchema.optional(),
});

export const createOrderSchema = z.object({
  cart: z
    .array(CartItemSchema)
    .nonempty({ message: "At least one ice cream must be selected." }),
  orderType: z.enum(["DineIn", "TakeAway", "Delivery"], {
    message: "Please select the Order Type",
  }),
  modeOfPayment: z.enum(["Cash", "Card", "UPI"], {
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
const createIceCreamSchemaWithId = createIceCreamSchema.extend({
  id: z.number(), // Add the id field of type number
});

// Now infer the type
export type CreateIcecream = z.infer<typeof createIceCreamSchemaWithId>;

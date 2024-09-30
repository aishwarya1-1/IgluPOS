import { z } from "zod";
export const createIceCreamSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  category: z.enum(["IceCream", "Falooda", "MilkShakes"], {
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

// export const createOrderSchema = z.object({
//   iceCreamIds: z
//     .array(z.number())
//     .nonempty({ message: "At least one ice cream must be selected." }),
//   modeOfPayment: z.enum(["Cash", "Card", "UPI"], {
//     invalid_type_error: "Invalid payment method selected.",
//   }),
// });

const createIceCreamSchemaWithId = createIceCreamSchema.extend({
  id: z.number(), // Add the id field of type number
});

// Now infer the type
export type CreateIcecream = z.infer<typeof createIceCreamSchemaWithId>;

const userWithIdExtend = registerUserSchema.extend({
  id: z.number(), // Add the id field of type number
});

// Now infer the type
export type userWithID = z.infer<typeof userWithIdExtend>;

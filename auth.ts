// auth.ts
import NextAuth, { Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { decrypt } from "./app/lib/actions";

const prisma = new PrismaClient();

// Extend the default User type to include userType and storeId
interface CustomUser extends User {
  userType?: string;
  storeId?: string;
  address?: string;
}

// Extend the default token to include id and userType
interface CustomJWT extends JWT {
  id?: string;
  userType?: string;
  storeId?: string;
  address?: string;
}

// Extend the default session to include id and userType
interface CustomSession extends Session {
  user: {
    id?: string;
    name?: string;
    address?: string;
    userType?: string;
    storeId?: string;
  };
}

// Get store user by username
async function getStoreUser(username: string) {
  try {
    const user = await prisma.login.findUnique({
      where: { username: username },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch store user:", error);
    throw new Error("Failed to fetch store user.");
  }
}

// Get employee user by username and verify store association
async function getEmployeeUser(username: string) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { name: username },
      include: { login: true },
    });
    return employee;
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    throw new Error("Failed to fetch employee.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string(),
            userType: z.string(),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password, userType } = parsedCredentials.data;

          // Different authentication logic based on user type
          if (userType === "store") {
            // Authenticate store admin
            const user = await getStoreUser(username);

            if (!user) return null;
            const decryptedPassword = await decrypt(user.password); // Decrypt stored password

            if (password === decryptedPassword) {
              return {
                id: String(user.id),
                address: user.address,
                name: user.username,
                userType: "store",
                storeId: String(user.id),
              } as CustomUser;
            }
          } else if (userType === "employee") {
            // Authenticate employee
            const employee = await getEmployeeUser(username);

            if (!employee) return null;

            const decryptedPassword = await decrypt(employee.password); // Decrypt stored password

            if (password === decryptedPassword) {
              return {
                id: employee.login.username,
                name: employee.name,
                // We can use the store's email as a fallback
                address: employee.login.address,
                userType: "employee",
                storeId: String(employee.loginId), // Keep track of which store this employee belongs to
              } as CustomUser;
            }
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const customToken = token as CustomJWT;
      const customUser = user as CustomUser | undefined;

      if (customUser) {
        customToken.id = customUser.id;
        customToken.userType = customUser.userType;
        customToken.storeId = customUser.storeId;
        customToken.address = customUser.address;
      }

      return customToken;
    },
    // This runs when a session is created
    async session({ session, token }) {
      const customSession = session as CustomSession;
      const customToken = token as CustomJWT;

      if (customToken.id) {
        customSession.user.id = customToken.id;
      }

      if (customToken.userType) {
        customSession.user.userType = customToken.userType;
      }

      if (customToken.storeId) {
        customSession.user.storeId = customToken.storeId;
      }

      if (customToken.address) {
        customSession.user.address = customToken.address;
      }

      return customSession;
    },
  },
});

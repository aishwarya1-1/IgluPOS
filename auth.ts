import NextAuth, { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

// Extend the default token to include id
interface CustomJWT extends JWT {
  id?: string;
}

// Extend the default session to include id
interface CustomSession extends Session {
  user: {
    id?: string;
    name?: string;
    email?: string;
  };
}

async function getUser(username: string): Promise<{
  id: number;
  email: string;
  username: string;
  password: string;
} | null> {
  try {
    const user = await prisma.login.findUnique({
      where: {
        username: username,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await getUser(username);

          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            // Ensure id is passed as a string
            return {
              id: String(user.id),
              email: user.email,
              name: user.username,
            };
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

      // Add user.id to the token on sign-in
      if (user) {
        customToken.id = user.id; // Assign user.id to token.id
      } else if (token.sub) {
        customToken.id = token.sub; // Map token.sub to token.id
      }

      //   console.log("JWT after update:", customToken); // Debug log
      return customToken;
    },
    // This runs when a session is created
    async session({ session, token }) {
      const customSession = session as CustomSession;
      const customToken = token as CustomJWT;

      // Add user.id to the session from token.id
      if (customToken.id) {
        customSession.user.id = customToken.id;
      }

      //   console.log("Session after update:", customSession); // Debug log
      return customSession;
    },
  },
});

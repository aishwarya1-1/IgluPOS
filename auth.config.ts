// auth.config.ts
import type { NextAuthConfig } from "next-auth";

// Extend the User type to include userType
declare module "next-auth" {
  interface User {
    userType?: string;
    storeId?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      address?: string | null;
      image?: string | null;
      userType?: string;
      storeId?: string;
    };
  }
}

export const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userType = auth?.user?.userType || "unknown";

      // Check paths that need authentication
      const isOnBilling = nextUrl.pathname.startsWith("/billing");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      // Redirect based on user type and requested path
      if (!isLoggedIn) {
        // Not logged in - allow access only to public pages
        return isOnBilling || isOnAdmin ? false : true;
      }

      // User is logged in - direct to the right dashboard based on role
      if (userType === "employee" && !isOnBilling) {
        // Employees should go to billing
        return Response.redirect(new URL("/billing", nextUrl));
      } else if (userType === "store" && !isOnAdmin) {
        // Store admins should go to admin dashboard
        return Response.redirect(new URL("/admin", nextUrl));
      }

      // Allow access to the correct dashboard based on user type
      if (
        (userType === "employee" && isOnBilling) ||
        (userType === "store" && isOnAdmin)
      ) {
        return true;
      }

      // Prevent access to the wrong dashboard
      if (
        (userType === "employee" && isOnAdmin) ||
        (userType === "store" && isOnBilling)
      ) {
        return false;
      }

      return true; // Allow access to other pages
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

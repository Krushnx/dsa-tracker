import "next-auth";
import "next-auth/jwt";

// Extend NextAuth's built-in types so `session.user.id` and `session.user.role`
// are available throughout the app with full TypeScript support.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

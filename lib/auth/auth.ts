import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User, UserSettings, Streak } from "@/models";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectDB();

        // Include passwordHash explicitly (it's select: false on the model)
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth — create user if first time
      if (account?.provider === "google") {
        await connectDB();

        const existing = await User.findOne({ email: user.email });

        if (!existing) {
          const newUser = await User.create({
            name: user.name ?? "User",
            email: user.email ?? "",
            image: user.image ?? "",
            provider: "google",
            emailVerified: true,
            role: "USER",
          });

          // Bootstrap default settings and streak for new user
          await Promise.all([
            UserSettings.create({ userId: newUser._id }),
            Streak.create({ userId: newUser._id }),
          ]);
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // For Google, look up the actual MongoDB _id by email
          await connectDB();
          const dbUser = await User.findOne({ email: user.email }).lean();
          token.id = dbUser?._id.toString() ?? user.id as string;
          token.role = (dbUser as { role?: string } | null)?.role ?? "USER";
        } else {
          // For credentials, id is already the MongoDB _id string
          token.id = user.id as string;
          token.role = (user as { role?: string }).role ?? "USER";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User, UserSettings, Streak } from "@/models";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Register a new user with credentials.
 * Called from the signup form via Server Action.
 */
export async function registerUser(data: RegisterInput): Promise<ActionResult> {
  // Validate input
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { name, email, password } = parsed.data;

  try {
    await connectDB();

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return { success: false, message: "An account with this email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      provider: "credentials",
      emailVerified: false,
      role: "USER",
    });

    // Bootstrap default settings and empty streak
    await Promise.all([
      UserSettings.create({ userId: newUser._id }),
      Streak.create({ userId: newUser._id }),
    ]);

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("[registerUser]", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

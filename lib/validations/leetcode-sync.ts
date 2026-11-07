import { z } from "zod";

// Validates a LeetCode username: trim whitespace, then enforce the allowed character set and length.
// Accepts 1–39 characters consisting of alphanumeric characters, hyphens, or underscores.
export const leetcodeUsernameSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9_-]{1,39}$/,
    "LeetCode username must be 1–39 characters: letters, numbers, hyphens, or underscores"
  );

// Used when saving LeetCode settings via PATCH /api/user/settings.
// An empty or whitespace-only username is transformed to null (clears the field).
// A non-empty username must still pass the format regex.
export const saveLeetCodeSettingsSchema = z.object({
  leetcodeUsername: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .refine(
      (v) => v === null || /^[a-zA-Z0-9_-]{1,39}$/.test(v),
      "Invalid LeetCode username format"
    ),
  leetcodeSyncEnabled: z.boolean(),
});

// Used to validate the request body for POST /api/leetcode/validate-username.
export const validateUsernameBodySchema = z.object({
  username: leetcodeUsernameSchema,
});

export type SaveLeetCodeSettingsInput = z.infer<typeof saveLeetCodeSettingsSchema>;
export type ValidateUsernameBodyInput = z.infer<typeof validateUsernameBodySchema>;

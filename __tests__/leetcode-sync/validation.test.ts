// Feature: leetcode-sync, Property 1: Username format validation is exhaustive
// Feature: leetcode-sync, Property 2: Blank and whitespace-only usernames always clear the field

import * as fc from "fast-check";
import {
  leetcodeUsernameSchema,
  saveLeetCodeSettingsSchema,
} from "@/lib/validations/leetcode-sync";

/**
 * Property 1: Username format validation is exhaustive
 *
 * For any string input, leetcodeUsernameSchema accepts the input if and only if
 * it matches /^[a-zA-Z0-9_-]{1,39}$/ after trimming.
 *
 * Validates: Requirements 1.2, 1.7
 */
describe("Property 1: Username format validation is exhaustive", () => {
  it("accepts a string iff it matches /^[a-zA-Z0-9_-]{1,39}$/ after trimming", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = leetcodeUsernameSchema.safeParse(input);
        const expected = /^[a-zA-Z0-9_-]{1,39}$/.test(input.trim());
        return result.success === expected;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Blank and whitespace-only usernames always clear the field
 *
 * For any string composed entirely of whitespace characters (spaces, tabs,
 * newlines) or the empty string, saveLeetCodeSettingsSchema produces
 * leetcodeUsername === null.
 *
 * Validates: Requirements 1.7
 */
describe("Property 2: Blank and whitespace-only usernames always clear the field", () => {
  it("transforms whitespace-only strings to null for leetcodeUsername", () => {
    // fc.stringOf was removed in fast-check v4; build whitespace-only strings
    // by joining an array of whitespace characters.
    const whitespaceOnlyString = fc
      .array(fc.constantFrom(" ", "\t", "\n"), { minLength: 1 })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(whitespaceOnlyString, (input) => {
        const result = saveLeetCodeSettingsSchema.safeParse({
          leetcodeUsername: input,
          leetcodeSyncEnabled: false,
        });
        // Parsing should succeed and produce null for leetcodeUsername
        if (!result.success) return false;
        return result.data.leetcodeUsername === null;
      }),
      { numRuns: 100 }
    );
  });

  it("transforms the empty string to null for leetcodeUsername", () => {
    const result = saveLeetCodeSettingsSchema.safeParse({
      leetcodeUsername: "",
      leetcodeSyncEnabled: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.leetcodeUsername).toBeNull();
    }
  });
});

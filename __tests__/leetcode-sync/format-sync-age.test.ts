// Feature: leetcode-sync, Property 15: Relative sync time formatting is correct for all intervals

import * as fc from "fast-check";
import { formatSyncAge } from "@/lib/utils/format-sync-age";

/**
 * Property 15: Relative sync time formatting is correct for all intervals
 *
 * For any past timestamp, formatSyncAge(timestamp) SHALL return:
 *   - "just now"       for elapsed time < 60 seconds
 *   - "X minutes ago"  for 1–59 minutes  (X = whole minutes)
 *   - "X hours ago"    for 1–23 hours    (X = whole hours)
 *   - "X days ago"     for 24+ hours     (X = whole days)
 *
 * Validates: Requirements 7.1
 */
describe("Property 15: Relative sync time formatting is correct for all intervals", () => {
  /**
   * Bucket 1: 0–59 seconds → "just now"
   */
  it('returns "just now" for elapsed time under 60 seconds', () => {
    fc.assert(
      fc.property(
        // Generate elapsed seconds in [0, 59]
        fc.integer({ min: 0, max: 59 }),
        (elapsedSec) => {
          const timestamp = new Date(Date.now() - elapsedSec * 1000);
          return formatSyncAge(timestamp) === "just now";
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Bucket 2: 60–3599 seconds (1–59 minutes) → "X minutes ago"
   */
  it('returns "X minutes ago" for elapsed time of 1–59 whole minutes', () => {
    fc.assert(
      fc.property(
        // Generate elapsed seconds in [60, 3599]
        fc.integer({ min: 60, max: 3599 }),
        (elapsedSec) => {
          const timestamp = new Date(Date.now() - elapsedSec * 1000);
          const result = formatSyncAge(timestamp);
          const expectedMinutes = Math.floor(elapsedSec / 60);
          const suffix = expectedMinutes === 1 ? "minute" : "minutes";
          return result === `${expectedMinutes} ${suffix} ago`;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Bucket 3: 3600–86399 seconds (1–23 hours) → "X hours ago"
   */
  it('returns "X hours ago" for elapsed time of 1–23 whole hours', () => {
    fc.assert(
      fc.property(
        // Generate elapsed seconds in [3600, 86399]
        fc.integer({ min: 3600, max: 86399 }),
        (elapsedSec) => {
          const timestamp = new Date(Date.now() - elapsedSec * 1000);
          const result = formatSyncAge(timestamp);
          const expectedHours = Math.floor(elapsedSec / 3600);
          const suffix = expectedHours === 1 ? "hour" : "hours";
          return result === `${expectedHours} ${suffix} ago`;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Bucket 4: 86400+ seconds (24+ hours) → "X days ago"
   */
  it('returns "X days ago" for elapsed time of 24+ hours', () => {
    fc.assert(
      fc.property(
        // Generate elapsed seconds from 86400 (1 day) up to 30 days
        fc.integer({ min: 86400, max: 86400 * 30 }),
        (elapsedSec) => {
          const timestamp = new Date(Date.now() - elapsedSec * 1000);
          const result = formatSyncAge(timestamp);
          const expectedDays = Math.floor(elapsedSec / 86400);
          const suffix = expectedDays === 1 ? "day" : "days";
          return result === `${expectedDays} ${suffix} ago`;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge cases: boundary values for each bucket transition
   */
  describe("bucket boundary edge cases", () => {
    it('returns "just now" at exactly 0 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now()))).toBe("just now");
    });

    it('returns "just now" at exactly 59 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 59_000))).toBe("just now");
    });

    it('returns "1 minute ago" at exactly 60 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 60_000))).toBe("1 minute ago");
    });

    it('returns "59 minutes ago" at exactly 3599 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 3599_000))).toBe("59 minutes ago");
    });

    it('returns "1 hour ago" at exactly 3600 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 3600_000))).toBe("1 hour ago");
    });

    it('returns "23 hours ago" at exactly 86399 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 86399_000))).toBe("23 hours ago");
    });

    it('returns "1 day ago" at exactly 86400 seconds elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 86400_000))).toBe("1 day ago");
    });

    it('returns "2 days ago" at exactly 2 days elapsed', () => {
      expect(formatSyncAge(new Date(Date.now() - 2 * 86400_000))).toBe("2 days ago");
    });
  });
});

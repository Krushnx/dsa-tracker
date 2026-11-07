// LeetCode public GraphQL endpoint — no credentials required
export const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

// AbortController timeout in milliseconds
const REQUEST_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface LeetCodeSubmission {
  titleSlug: string;
  timestamp: number; // Unix timestamp (seconds)
}

// unix_ts_string → submission count for that day
export type SubmissionCalendar = Record<string, number>;

export interface ILeetCodeClient {
  validateUsername(username: string): Promise<boolean>;
  fetchUserStats(username: string): Promise<LeetCodeStats>;
  fetchRecentSubmissions(username: string, limit?: number): Promise<LeetCodeSubmission[]>;
  fetchSubmissionCalendar(username: string): Promise<SubmissionCalendar>;
}

// ---------------------------------------------------------------------------
// Typed error classes
// ---------------------------------------------------------------------------

/**
 * Thrown when LeetCode's GraphQL endpoint returns an HTTP 4xx or 5xx status.
 */
export class LeetCodeHttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message?: string) {
    super(message ?? `LeetCode API returned HTTP ${statusCode}`);
    this.name = "LeetCodeHttpError";
    this.statusCode = statusCode;
  }
}

/**
 * Thrown when a request to LeetCode's endpoint does not complete within the
 * 10-second AbortController timeout.
 */
export class LeetCodeTimeoutError extends Error {
  constructor(message?: string) {
    super(message ?? "LeetCode API request timed out after 10 seconds");
    this.name = "LeetCodeTimeoutError";
  }
}

/**
 * Thrown when a low-level network failure occurs (DNS resolution failure,
 * connection refused, etc.) before any HTTP response is received.
 */
export class LeetCodeNetworkError extends Error {
  readonly cause: unknown;

  constructor(cause?: unknown, message?: string) {
    super(message ?? "Network error while connecting to LeetCode API");
    this.name = "LeetCodeNetworkError";
    this.cause = cause;
  }
}

/**
 * Thrown when LeetCode returns an HTTP 200 response but the payload does not
 * contain the expected fields (e.g., stats fields are null or missing).
 */
export class LeetCodeInvalidResponseError extends Error {
  constructor(message?: string) {
    super(message ?? "LeetCode API returned an unexpected or invalid response");
    this.name = "LeetCodeInvalidResponseError";
  }
}

// ---------------------------------------------------------------------------
// Base GraphQL fetch helper
// ---------------------------------------------------------------------------

/**
 * Sends a GraphQL request to the LeetCode public endpoint.
 *
 * Every call is wrapped in an AbortController with a 10-second timeout.
 * The caller is responsible for parsing the returned `data` object.
 *
 * @throws {LeetCodeTimeoutError}   if the request does not complete in 10 s
 * @throws {LeetCodeHttpError}      if the response status is 4xx or 5xx
 * @throws {LeetCodeNetworkError}   if a low-level network failure occurs
 */
export async function graphqlFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://leetcode.com/",
        Origin: "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch (err) {
    // AbortController fires a DOMException with name "AbortError"
    if (err instanceof Error && err.name === "AbortError") {
      throw new LeetCodeTimeoutError();
    }
    throw new LeetCodeNetworkError(err);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new LeetCodeHttpError(response.status);
  }

  // Parse and return the `data` field of the GraphQL response
  const json = (await response.json()) as { data: T };
  return json.data;
}

// ---------------------------------------------------------------------------
// Task 3.2 – validateUsername
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the given LeetCode username corresponds to an existing
 * public profile, `false` if the profile is not found.
 *
 * @throws {LeetCodeHttpError}     on 4xx / 5xx HTTP responses
 * @throws {LeetCodeTimeoutError}  if the request does not complete within 10 s
 * @throws {LeetCodeNetworkError}  on low-level network failures
 */
export async function validateUsername(username: string): Promise<boolean> {
  const query = `
    query ValidateUsername($username: String!) {
      matchedUser(username: $username) {
        username
      }
    }
  `;

  const data = await graphqlFetch<{ matchedUser: { username: string } | null }>(
    query,
    { username }
  );

  return data.matchedUser !== null;
}

// ---------------------------------------------------------------------------
// Task 3.3 – fetchUserStats
// ---------------------------------------------------------------------------

/**
 * Fetches the aggregated solve counts from a user's public LeetCode profile.
 *
 * @throws {LeetCodeInvalidResponseError} if any of the four difficulty counts
 *   is null, undefined, or absent in the API response
 * @throws {LeetCodeHttpError}     on 4xx / 5xx HTTP responses
 * @throws {LeetCodeTimeoutError}  if the request does not complete within 10 s
 * @throws {LeetCodeNetworkError}  on low-level network failures
 */
export async function fetchUserStats(username: string): Promise<LeetCodeStats> {
  const query = `
    query FetchUserStats($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  interface AcSubmission {
    difficulty: string;
    count: number | null | undefined;
  }

  const data = await graphqlFetch<{
    matchedUser: {
      submitStats: {
        acSubmissionNum: AcSubmission[];
      };
    } | null;
  }>(query, { username });

  const acNums = data?.matchedUser?.submitStats?.acSubmissionNum ?? [];

  const findCount = (difficulty: string): number => {
    const entry = acNums.find((e) => e.difficulty === difficulty);
    if (entry == null || entry.count == null) {
      throw new LeetCodeInvalidResponseError(
        `LeetCode API returned null/missing count for difficulty "${difficulty}"`
      );
    }
    return entry.count;
  };

  const totalSolved = findCount("All");
  const easySolved = findCount("Easy");
  const mediumSolved = findCount("Medium");
  const hardSolved = findCount("Hard");

  return { totalSolved, easySolved, mediumSolved, hardSolved };
}

// ---------------------------------------------------------------------------
// Task 3.4 – fetchRecentSubmissions
// ---------------------------------------------------------------------------

/**
 * Fetches the most recent accepted submissions for a user.
 *
 * The returned array is unfiltered — callers are responsible for any
 * additional validation (e.g., non-empty `titleSlug`, positive `timestamp`).
 *
 * @param username  LeetCode username
 * @param limit     Maximum number of submissions to fetch (default: 20)
 *
 * @throws {LeetCodeHttpError}     on 4xx / 5xx HTTP responses
 * @throws {LeetCodeTimeoutError}  if the request does not complete within 10 s
 * @throws {LeetCodeNetworkError}  on low-level network failures
 */
export async function fetchRecentSubmissions(
  username: string,
  limit = 20
): Promise<LeetCodeSubmission[]> {
  const query = `
    query FetchRecentSubmissions($username: String!, $limit: Int) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        titleSlug
        timestamp
      }
    }
  `;

  const data = await graphqlFetch<{
    recentAcSubmissionList: Array<{ titleSlug: string; timestamp: string }>;
  }>(query, { username, limit });

  const raw = data?.recentAcSubmissionList ?? [];

  // The LeetCode API returns timestamp as a numeric string; coerce to number.
  return raw.map((s) => ({
    titleSlug: s.titleSlug,
    timestamp: typeof s.timestamp === "string" ? Number(s.timestamp) : (s.timestamp as number),
  }));
}

// ---------------------------------------------------------------------------
// Task 3.5 – fetchSubmissionCalendar
// ---------------------------------------------------------------------------

/**
 * Fetches the submission calendar for a user.
 *
 * LeetCode returns `submissionCalendar` as a JSON-encoded string
 * (e.g. `'{"1609459200":3,"1609545600":1}'`). This function parses it and
 * returns a typed `SubmissionCalendar` map.
 *
 * @throws {LeetCodeInvalidResponseError} if the calendar field is missing or
 *   the JSON string cannot be parsed
 * @throws {LeetCodeHttpError}     on 4xx / 5xx HTTP responses
 * @throws {LeetCodeTimeoutError}  if the request does not complete within 10 s
 * @throws {LeetCodeNetworkError}  on low-level network failures
 */
export async function fetchSubmissionCalendar(
  username: string
): Promise<SubmissionCalendar> {
  const query = `
    query FetchSubmissionCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar {
          submissionCalendar
        }
      }
    }
  `;

  const data = await graphqlFetch<{
    matchedUser: {
      userCalendar: {
        submissionCalendar: string;
      };
    } | null;
  }>(query, { username });

  const calendarJson = data?.matchedUser?.userCalendar?.submissionCalendar;

  if (calendarJson == null) {
    throw new LeetCodeInvalidResponseError(
      "LeetCode API returned null/missing submissionCalendar field"
    );
  }

  try {
    return JSON.parse(calendarJson) as SubmissionCalendar;
  } catch {
    throw new LeetCodeInvalidResponseError(
      "Failed to parse submissionCalendar JSON from LeetCode API"
    );
  }
}

// ---------------------------------------------------------------------------
// Default singleton client
// ---------------------------------------------------------------------------

/**
 * Default `ILeetCodeClient` singleton.
 *
 * Import and use this instance throughout the app instead of constructing a
 * new client each time:
 *
 * ```ts
 * import leetcodeClient from "@/lib/leetcode/leetcode-client";
 * const valid = await leetcodeClient.validateUsername("torvalds");
 * ```
 */
const leetcodeClient: ILeetCodeClient = {
  validateUsername,
  fetchUserStats,
  fetchRecentSubmissions,
  fetchSubmissionCalendar,
};

export default leetcodeClient;

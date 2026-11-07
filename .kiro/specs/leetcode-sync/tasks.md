# Implementation Plan: LeetCode Sync

## Overview

Implement the LeetCode Sync feature (Approach A — Stats Sync) across six layers: data models, validation schemas, the LeetCode client, the sync service, API routes, and frontend UI components. Each layer builds on the previous. Property-based tests (fast-check) are woven in close to the logic they cover; unit and integration tests follow the same pattern.

---

## Tasks

- [ ] 1. Data models and schema extensions
  - [ ] 1.1 Extend `IUser` interface and `UserSchema` with `leetcodeUsername` and `leetcodeSyncEnabled`
    - Add optional `leetcodeUsername?: string` and `leetcodeSyncEnabled: boolean` (default `false`) to `types/index.ts`
    - Add matching fields to the Mongoose schema in `models/User.ts` with `trim: true`, `sparse: true`, regex match, and `default: false` as specified in the design
    - Add sparse index on `leetcodeUsername` for cron lookups
    - _Requirements: 1.2, 1.6, 1.7, 9.1_

  - [ ] 1.2 Extend `IUserProblem` interface and `UserProblemSchema` with `source` field
    - Add `source?: "MANUAL" | "LEETCODE_SYNC"` to `types/index.ts`
    - Add `source` enum field to `models/UserProblem.ts` (no default — undefined for legacy records)
    - _Requirements: 5.6_

  - [ ] 1.3 Create `ILeetCodeSync` interface and `LeetCodeSync` Mongoose model
    - Add `ILeetCodeSync` to `types/index.ts` with all fields from the design (`userId`, `status`, `startedAt`, `completedAt`, `stats`, `newlySolvedCount`, `error`, timestamps)
    - Create `models/LeetCodeSync.ts` with the schema, compound indexes `{ userId: 1, startedAt: -1 }` and `{ userId: 1, status: 1 }`, and `timestamps: true`
    - Export from `models/index.ts`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Validation schemas
  - [ ] 2.1 Create `lib/validations/leetcode-sync.ts` with Zod schemas
    - Implement `leetcodeUsernameSchema`: trim + regex `/^[a-zA-Z0-9_-]{1,39}$/`
    - Implement `saveLeetCodeSettingsSchema`: empty/blank string → `null` transform, nullable with format refine
    - Implement `validateUsernameBodySchema`
    - _Requirements: 1.2, 1.7_

  - [ ]* 2.2 Write property test for username format validation (Property 1)
    - **Property 1: Username format validation is exhaustive**
    - Generate arbitrary strings with fast-check `fc.string()`; assert `leetcodeUsernameSchema` accepts iff string matches `/^[a-zA-Z0-9_-]{1,39}$/`
    - **Validates: Requirements 1.2, 1.7**

  - [ ]* 2.3 Write property test for blank/whitespace username clearing (Property 2)
    - **Property 2: Blank and whitespace-only usernames always clear the field**
    - Generate whitespace-only strings (`fc.stringOf(fc.constantFrom(' ', '\t', '\n'))`); assert `saveLeetCodeSettingsSchema` produces `null` for `leetcodeUsername`
    - **Validates: Requirements 1.7**

- [ ] 3. LeetCode client
  - [ ] 3.1 Create `lib/leetcode/leetcode-client.ts` with typed client
    - Define exported types: `LeetCodeStats`, `LeetCodeSubmission`, `SubmissionCalendar`, `ILeetCodeClient`
    - Define typed error classes: `LeetCodeHttpError`, `LeetCodeTimeoutError`, `LeetCodeNetworkError`, `LeetCodeInvalidResponseError`
    - Apply `AbortController` with 10-second timeout to every `fetch` call
    - _Requirements: 3.5, 4.5_

  - [ ] 3.2 Implement `validateUsername(username)` in the LeetCode client
    - Query `matchedUser(username)` → return `true` if user found, `false` if null
    - Throw `LeetCodeHttpError` on 4xx/5xx, `LeetCodeTimeoutError` on abort, `LeetCodeNetworkError` on fetch failure
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 3.3 Implement `fetchUserStats(username)` in the LeetCode client
    - Query `userPublicProfile` → `submitStats.acSubmissionNum`; parse into `LeetCodeStats`
    - Throw `LeetCodeInvalidResponseError` if any of the four fields is null/missing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.4 Implement `fetchRecentSubmissions(username, limit = 20)` in the LeetCode client
    - Query `recentAcSubmissionList(username, limit: 20)` → `{ titleSlug, timestamp }`
    - _Requirements: 4.1, 4.4, 4.5_

  - [ ] 3.5 Implement `fetchSubmissionCalendar(username)` in the LeetCode client
    - Query `userProfileCalendar` → `submissionCalendar` (JSON-parse the returned string into `SubmissionCalendar`)
    - _Requirements: 4.6_

- [ ] 4. Checkpoint — core infrastructure ready
  - Ensure all TypeScript types compile and Mongoose schemas export without errors.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Sync service
  - [ ] 5.1 Create `lib/services/leetcode-sync.service.ts` with `SyncStatus`, `SyncStage`, `SyncFailureReason`, and `SyncResult` types
    - Export types alongside the service functions so API routes and tests can import them
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 5.2 Implement `getSyncStatus(userId)` and `getCronEligibleUsers()` in the sync service
    - `getSyncStatus`: query the `leetcodeSyncs` collection for the most recent record for `userId`, return as `SyncResult | null`
    - `getCronEligibleUsers`: query users where `leetcodeUsername` is set AND `leetcodeSyncEnabled: true` AND most recent `startedAt` is ≥ 60 minutes old (or no record exists)
    - _Requirements: 9.1, 9.2_

  - [ ]* 5.3 Write property test for cron eligibility filtering (Properties 17, 18)
    - **Property 17: Cron job processes only eligible users**
    - **Property 18: Cron job respects 60-minute cooldown per user**
    - Generate arrays of user objects with random `leetcodeUsername` (string | null) and `leetcodeSyncEnabled` (boolean); generate `startedAt` timestamps spanning from 0 to 120 minutes before now
    - Assert `getCronEligibleUsers` returns only users satisfying both conditions
    - **Validates: Requirements 9.1, 9.2**

  - [ ] 5.4 Implement submission filtering and cross-reference logic in the sync service
    - Filter raw submissions: keep only entries where `titleSlug` is a non-empty string AND `timestamp` is a positive number
    - Batch-lookup problems by `slug` using a single MongoDB `$in` query
    - Build `bulkWrite` operations: skip if already SOLVED (preserve `solvedAt`), upsert to SOLVED + LEETCODE_SYNC otherwise; set `solvedAt` to `submission.timestamp` or `startedAt` as fallback
    - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 5.5 Write property test for submission filtering (Property 6)
    - **Property 6: Submission filtering drops incomplete entries**
    - Generate arrays of objects with randomly present/absent/null `titleSlug` and `timestamp` fields
    - Assert filtered list contains only entries where both are valid (non-empty string + positive number)
    - **Validates: Requirements 4.2**

  - [ ]* 5.6 Write property test for partial submission lists (Property 7)
    - **Property 7: Partial submission lists are processed without error**
    - Generate integers N in `[0, 20]`; build a submission array of length N with valid entries
    - Assert the cross-reference step completes without throwing for all N
    - **Validates: Requirements 4.3**

  - [ ]* 5.7 Write property test for UserProblem upsert correctness (Property 8)
    - **Property 8: Matching submissions upsert UserProblem to SOLVED with correct source**
    - Generate sets of submissions and matching problems; run the upsert logic against an in-memory representation
    - Assert every matched pair results in `status: SOLVED` and `source: LEETCODE_SYNC`
    - **Validates: Requirements 5.1, 5.6**

  - [ ]* 5.8 Write property test for solvedAt preservation (Property 9)
    - **Property 9: solvedAt is set correctly and never overwritten for already-SOLVED records**
    - Generate UserProblem records with `status: SOLVED` and a non-null `solvedAt` date; run upsert logic
    - Assert `solvedAt` is unchanged; also generate records without `solvedAt` and assert it is set to submission timestamp (or `startedAt` fallback)
    - **Validates: Requirements 5.2, 5.3, 5.4**

  - [ ]* 5.9 Write property test for unmatched submissions (Property 10)
    - **Property 10: Unmatched submissions are skipped without error**
    - Generate submissions with slugs absent from the problems collection; run cross-reference
    - Assert no UserProblem records are created or modified
    - **Validates: Requirements 5.5**

  - [ ]* 5.10 Write property test for newlySolvedCount accuracy (Property 11)
    - **Property 11: newlySolvedCount equals actual non-SOLVED → SOLVED transitions**
    - Generate UserProblem records with statuses drawn from `["TODO", "ATTEMPTED", "REVISION", "SOLVED"]` and corresponding submissions
    - Assert `newlySolvedCount` equals the count of records that transitioned from non-SOLVED to SOLVED
    - **Validates: Requirements 5.7**

  - [ ] 5.11 Implement `runSync(userId)` orchestrator in the sync service
    - Steps 1–11 from the design algorithm: check IN_PROGRESS conflict (→ 409 equivalent), evict oldest if count ≥ 10, insert IN_PROGRESS record, call client methods in order (abort on each failure), cross-reference, bulk-upsert, update to COMPLETED
    - Wrap each stage in try/catch; map errors to `SyncFailureReason`; update Sync_Record to FAILED with `stage` + `reason` on any error
    - _Requirements: 2.2, 2.5, 3.1–3.5, 4.1–4.6, 5.1–5.7, 6.1–6.4, 10.1–10.7_

  - [ ]* 5.12 Write property test for valid stats stored exactly (Property 3)
    - **Property 3: Valid stats responses are stored exactly**
    - Generate `{totalSolved, easySolved, mediumSolved, hardSolved}` with `fc.nat()` (positive integers)
    - Assert the Sync_Record `stats` sub-document contains exactly those values after a successful sync
    - **Validates: Requirements 3.2**

  - [ ]* 5.13 Write property test for invalid stats producing FAILED (Property 4)
    - **Property 4: Invalid stats responses always produce FAILED status**
    - Generate stats objects where at least one field is null/undefined/absent; feed into the sync service
    - Assert Sync_Record has `status: FAILED` and `error.reason: INVALID_RESPONSE`
    - **Validates: Requirements 3.3**

  - [ ]* 5.14 Write property test for HTTP errors producing FAILED (Property 5)
    - **Property 5: HTTP errors during any sync phase always produce FAILED status**
    - Generate HTTP status codes in `[400, 599]` using `fc.integer({ min: 400, max: 599 })`; simulate `LeetCodeHttpError` during each sync phase
    - Assert Sync_Record has `status: FAILED` and no UserProblem records are modified
    - **Validates: Requirements 3.4, 4.4, 10.7**

  - [ ]* 5.15 Write property test for network errors leaving UserProblems unchanged (Property 20)
    - **Property 20: Network errors leave UserProblem records unchanged**
    - Generate a pre-existing set of UserProblem records; simulate `LeetCodeNetworkError`
    - Assert all records are identical before and after the failed sync
    - **Validates: Requirements 10.1, 10.2**

  - [ ]* 5.16 Write property test for batch upsert failure rollback (Property 21)
    - **Property 21: Batch upsert failure rolls back all changes**
    - Simulate a `bulkWrite` failure after partial writes; assert all UserProblem records remain at pre-sync state and Sync_Record has `status: FAILED`, `stage: PERSIST`
    - **Validates: Requirements 10.5, 10.6**

  - [ ]* 5.17 Write property test for completed sync record completeness (Property 12)
    - **Property 12: Successful sync record always has all required fields populated**
    - Generate valid sync inputs; run `runSync`; assert Sync_Record has `status: COMPLETED`, non-null `completedAt`, `stats` with all four fields, and non-null `newlySolvedCount`
    - **Validates: Requirements 6.2**

  - [ ]* 5.18 Write property test for failed sync record error details (Property 13)
    - **Property 13: Failed sync record always has error details populated**
    - Simulate failures at each `SyncStage`; assert resulting Sync_Record has `status: FAILED`, non-null `completedAt`, and `error.stage` + `error.reason` both populated
    - **Validates: Requirements 6.3**

  - [ ]* 5.19 Write property test for sync record count cap (Property 14)
    - **Property 14: Sync record count per user never exceeds 10**
    - Generate N existing records per user where `fc.integer({ min: 10, max: 20 })`; trigger a new sync
    - Assert total count after sync is exactly 10 and the oldest records were evicted
    - **Validates: Requirements 6.4**

- [ ] 6. Checkpoint — service and client logic complete
  - Ensure all service unit and property tests pass. Ask the user if questions arise.

- [ ] 7. Utility functions
  - [ ] 7.1 Create `lib/utils/format-sync-age.ts` with `formatSyncAge(timestamp: Date): string`
    - Return `"just now"` for < 60 s, `"X minutes ago"` for 1–59 min, `"X hours ago"` for 1–23 h, `"X days ago"` for ≥ 24 h
    - _Requirements: 7.1_

  - [ ]* 7.2 Write property test for relative sync time formatting (Property 15)
    - **Property 15: Relative sync time formatting is correct for all intervals**
    - Generate timestamps using `fc.date()` bounded to [0 s, 30 days] in the past; assert `formatSyncAge` output matches the specification for each interval bucket
    - **Validates: Requirements 7.1**

- [ ] 8. API routes
  - [ ] 8.1 Create `POST /api/leetcode/validate-username/route.ts`
    - Validate session (401 if missing); parse body with `validateUsernameBodySchema` (400 on Zod failure); call `leetcodeClient.validateUsername()`; return 200 `{valid: true}`, 422 `{error: "profile_not_found"}`, or 503 `{error: "service_unavailable"}`
    - _Requirements: 1.3, 1.4, 1.5, 10.3_

  - [ ] 8.2 Create `POST /api/leetcode/sync/route.ts`
    - Validate session (401); verify userId matches session (403); check user has `leetcodeUsername` (400); call `runSync(userId)`; return 202 `{syncId}` or 409 if already IN_PROGRESS
    - _Requirements: 2.2, 2.5, 10.3, 10.4_

  - [ ] 8.3 Create `GET /api/leetcode/sync/status/route.ts`
    - Validate session (401); call `getSyncStatus(userId)`; return the Sync_Record as `SyncResult | null`
    - _Requirements: 2.3, 7.1, 7.2, 7.3, 8.1, 8.3_

  - [ ] 8.4 Extend `GET /api/user/settings/route.ts` to include `leetcodeUsername` and `leetcodeSyncEnabled`
    - Read the two new fields from the `users` collection and include them in the response object
    - _Requirements: 1.8, 9.5_

  - [ ] 8.5 Extend `PATCH /api/user/settings/route.ts` to accept and persist LeetCode settings
    - Parse `leetcodeUsername` (string | null) and `leetcodeSyncEnabled` (boolean) using `saveLeetCodeSettingsSchema`; persist to the `users` collection; if username is null, also set `leetcodeSyncEnabled: false`
    - _Requirements: 1.6, 1.7, 9.4, 9.6_

  - [ ] 8.6 Create `GET /api/cron/leetcode-sync/route.ts`
    - Validate `x-cron-secret` header (401 if missing/wrong); call `getCronEligibleUsers()`; run `runSync()` for each via `Promise.allSettled`; return `{processed, skipped, failed}`
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9. Checkpoint — API routes complete
  - Ensure all routes compile and respond correctly in manual smoke tests. Ask the user if questions arise.

- [ ] 10. Frontend — Profile Settings UI
  - [ ] 10.1 Create `LeetCodeSettingsSection` client component in `app/(app)/profile/`
    - Render "LeetCode Username" text input pre-populated from `GET /api/user/settings`
    - On save, call `POST /api/leetcode/validate-username` before `PATCH /api/user/settings`; show inline field error using React Hook Form + Zod on validation failure
    - Render "Enable automatic sync" toggle bound to `leetcodeSyncEnabled`; show success toast on save ("Automatic sync enabled" / "Automatic sync disabled") via shadcn/ui `useToast`
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.8, 9.4, 9.5, 9.6_

  - [ ] 10.2 Integrate `LeetCodeSettingsSection` into `app/(app)/profile/page.tsx`
    - Import and render the component below the existing profile settings
    - _Requirements: 1.1, 1.8_

- [ ] 11. Frontend — Dashboard LeetCode Sync section
  - [ ] 11.1 Create `LeetCodeSyncSection` client component in `app/(app)/dashboard/`
    - Fetch `GET /api/leetcode/sync/status` on mount; set up polling every 3 s while `status === "IN_PROGRESS"`; stop polling after 3 consecutive fetch failures
    - Implement conditional rendering: no-username prompt → link to `/profile`; has username with no completed sync → "Never synced" + sync button; has completed sync → "LeetCode Stats" card grid + "Last synced X ago" label + sync button; IN_PROGRESS → loading spinner + disabled button
    - On sync button click: POST to `/api/leetcode/sync`; set optimistic loading state via Zustand; re-start polling
    - _Requirements: 2.1, 2.3, 2.4, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4_

  - [ ] 11.2 Implement sync failure toast in `LeetCodeSyncSection`
    - When polling detects transition to `FAILED` status, show shadcn/ui toast "Sync failed. Please try again later." with `duration: 4000` (minimum 4 s)
    - Display "Last sync failed {relative time}" label when most recent record is FAILED
    - _Requirements: 7.3, 10.8_

  - [ ]* 11.3 Write property test for dashboard stats display source (Property 16)
    - **Property 16: Dashboard displays LeetCode stats from most recent COMPLETED record**
    - Generate users with mixed Sync_Record arrays (COMPLETED / FAILED / IN_PROGRESS); verify that the stats sourced by the UI equal those from the most recent COMPLETED record, not a more recent FAILED or IN_PROGRESS one
    - **Validates: Requirements 8.1, 8.3**

  - [ ]* 11.4 Write property test for cron failure isolation (Property 19)
    - **Property 19: Individual cron failures do not abort remaining users**
    - Generate a list of N users where a random subset throws during `runSync`; assert `Promise.allSettled` processes all N users and the summary counts are accurate
    - **Validates: Requirements 9.3**

  - [ ] 11.5 Integrate `LeetCodeSyncSection` into `app/(app)/dashboard/page.tsx`
    - Import and render the component in the dashboard layout, separate from the in-app stats section
    - _Requirements: 8.4_

- [ ] 12. Final checkpoint — end-to-end verification
  - Ensure all tests (unit, property-based, integration) pass.
  - Verify TypeScript compiles without errors (`tsc --noEmit`).
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; core sync behaviour is fully functional without them.
- Each task references specific requirements for traceability.
- Property tests use [fast-check](https://fast-check.dev/) with a minimum of 100 iterations each; each is tagged with its design property number.
- Unit tests and property tests are complementary — property tests cover input-space breadth, unit tests cover specific edge cases and example scenarios.
- Checkpoints ensure incremental validation after each major layer.
- The atomicity note in the design applies: true rollback on `bulkWrite` partial failure is a known MVP limitation; the `error.detail` field records how many ops completed before failure.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["5.1", "7.1"] },
    { "id": 5, "tasks": ["5.2", "5.4"] },
    { "id": 6, "tasks": ["5.3", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10", "7.2"] },
    { "id": 7, "tasks": ["5.11"] },
    { "id": 8, "tasks": ["5.12", "5.13", "5.14", "5.15", "5.16", "5.17", "5.18", "5.19"] },
    { "id": 9, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 10, "tasks": ["10.1", "10.2"] },
    { "id": 11, "tasks": ["11.1"] },
    { "id": 12, "tasks": ["11.2", "11.3", "11.4", "11.5"] }
  ]
}
```

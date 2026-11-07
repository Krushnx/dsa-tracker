# Requirements Document

## Introduction

LeetCode Sync (Approach A — Stats Sync) allows users to connect their LeetCode public profile to DSA Tracker. The system fetches publicly available data from LeetCode's GraphQL endpoint — total solved counts by difficulty, the last 20 accepted submissions, and the submission activity calendar — without requiring any LeetCode credentials. It cross-references fetched submissions against the app's problems database to automatically mark matching problems as SOLVED in the user's progress, displays aggregate stats on the dashboard, and shows a sync status indicator. Users initiate sync manually via a button; an optional background cron job supports periodic automated sync.

---

## Glossary

- **LeetCode_Client**: The module responsible for querying LeetCode's public GraphQL endpoint (`https://leetcode.com/graphql`).
- **Sync_Service**: The backend service that orchestrates the sync workflow — fetching data via the LeetCode_Client, cross-referencing against the problems database, and persisting results.
- **Sync_Record**: A document in the `leetcodeSyncs` collection that stores metadata about a single sync execution (timestamp, status, counts, errors).
- **User_Profile**: The user's account document in the `users` collection, extended with `leetcodeUsername` and `leetcodeSyncEnabled` fields.
- **UserProblem**: An existing document in the `userProblems` collection tracking a user's status for a specific problem.
- **Problem**: An existing document in the `problems` collection, identified by `leetcodeId` and `slug`.
- **Submission**: A single accepted submission entry returned by LeetCode's GraphQL API, containing the problem's `titleSlug` and submission timestamp.
- **Stats**: Aggregated counts of total, easy, medium, and hard solved problems from a user's public LeetCode profile.
- **Submission_Calendar**: A map of Unix timestamps to daily submission counts returned by LeetCode's public API.
- **Dashboard**: The existing `/dashboard` page of DSA Tracker where aggregate stats and sync status are displayed.
- **Profile_Settings**: The existing `/profile` page where the user manages their account, extended to include LeetCode username input and sync controls.

---

## Requirements

### Requirement 1: LeetCode Username Configuration

**User Story:** As a user, I want to enter and save my LeetCode username in my profile settings, so that the system knows which public profile to sync data from.

#### Acceptance Criteria

1. THE Profile_Settings SHALL display a text input field labelled "LeetCode Username" within the profile page.
2. WHEN a user submits a non-empty LeetCode username, THE Sync_Service SHALL trim leading and trailing whitespace from the input before processing, and SHALL validate that the username is between 1 and 39 characters consisting of alphanumeric characters, hyphens, or underscores.
3. WHEN a user submits a username that passes format validation, THE Sync_Service SHALL validate that the username corresponds to an existing public LeetCode profile by querying the LeetCode_Client before saving.
4. IF the LeetCode_Client returns no data for the provided username, THEN THE Sync_Service SHALL return a profile-not-found error to the client.
5. IF the LeetCode_Client is unavailable or returns an unexpected error during username validation, THEN THE Sync_Service SHALL return a service-unavailable error to the client.
6. WHEN a valid LeetCode username is confirmed, THE Sync_Service SHALL persist the username in the `leetcodeUsername` field of the User_Profile document.
7. WHEN a user submits an empty or blank username field, THE Sync_Service SHALL remove the `leetcodeUsername` value from the User_Profile document and disable all sync functionality for that user.
8. WHEN the Profile_Settings page loads, THE Profile_Settings SHALL display the currently saved LeetCode username in the input field.

---

### Requirement 2: Manual Sync Trigger

**User Story:** As a user, I want to trigger a LeetCode sync manually from my dashboard or profile, so that I can update my progress on demand.

#### Acceptance Criteria

1. WHEN the Dashboard page loads and a user has a saved LeetCode username, THE Dashboard SHALL display a "Sync with LeetCode" button.
2. WHEN a user clicks the "Sync with LeetCode" button, THE Sync_Service SHALL initiate a sync for that user's LeetCode profile and SHALL return HTTP 202 Accepted.
3. WHILE a sync is in progress for the current user, THE Dashboard SHALL display a loading indicator on the "Sync with LeetCode" button and disable the button to prevent duplicate submissions.
4. IF a user has no saved LeetCode username, THEN WHEN the Dashboard page loads, THE Dashboard SHALL display a prompt linking to Profile_Settings instead of the sync button.
5. IF a sync request is received while another sync for the same user is already IN_PROGRESS, THEN THE Sync_Service SHALL return HTTP 409.

---

### Requirement 3: Fetch LeetCode Stats

**User Story:** As a user, I want my total LeetCode solved counts (easy, medium, hard) to be fetched during sync, so that I can see my LeetCode aggregate stats alongside my in-app progress.

#### Acceptance Criteria

1. WHEN a sync is initiated, THE LeetCode_Client SHALL query LeetCode's public GraphQL endpoint for the user's total solved count, easy solved count, medium solved count, and hard solved count.
2. WHEN LeetCode's GraphQL endpoint returns a valid stats response (a response containing non-null integer values for totalSolved, easySolved, mediumSolved, and hardSolved), THE Sync_Service SHALL store the fetched Stats in the most recent Sync_Record.
3. IF the LeetCode_Client receives an HTTP 200 response where any of totalSolved, easySolved, mediumSolved, or hardSolved is null or missing, THEN THE Sync_Service SHALL mark the Sync_Record status as `FAILED` with error `INVALID_RESPONSE`.
4. IF the LeetCode_Client receives an HTTP error response (4xx or 5xx) from the GraphQL endpoint, THEN THE Sync_Service SHALL mark the Sync_Record status as `FAILED` and record the HTTP status code in the Sync_Record's error field.
5. IF the LeetCode_Client does not receive a response within 10 seconds, THEN THE Sync_Service SHALL abort the request and mark the Sync_Record status as `FAILED` with error `TIMEOUT`.

---

### Requirement 4: Fetch Recent Accepted Submissions

**User Story:** As a user, I want my last 20 accepted LeetCode submissions to be fetched during sync, so that recently solved problems are automatically marked as solved in my tracker.

#### Acceptance Criteria

1. WHEN a sync is initiated, THE LeetCode_Client SHALL query LeetCode's public GraphQL endpoint for the 20 most recent accepted submissions for the user's username.
2. WHEN the LeetCode_Client returns a list of Submissions, THE Sync_Service SHALL extract the `titleSlug` and submission timestamp from each Submission; IF a Submission entry is missing `titleSlug` or timestamp, THEN THE Sync_Service SHALL skip that entry without error.
3. IF the LeetCode_Client returns fewer than 20 Submissions (including zero), THEN THE Sync_Service SHALL process only the Submissions that were returned without treating a partial result as an error.
4. IF the LeetCode_Client receives an HTTP error response (4xx or 5xx) when fetching submissions, THEN THE Sync_Service SHALL mark the Sync_Record as `FAILED` and record the HTTP status code in the Sync_Record's error field.
5. IF the LeetCode_Client does not receive a submissions response within 10 seconds, THEN THE Sync_Service SHALL abort and mark the Sync_Record as `FAILED` with error `TIMEOUT`.
6. WHEN a sync is initiated, THE LeetCode_Client SHALL query LeetCode's public GraphQL endpoint for the user's Submission_Calendar data.

---

### Requirement 5: Cross-Reference and Auto-Mark Problems as SOLVED

**User Story:** As a user, I want my recently synced LeetCode submissions to be automatically matched to problems in my tracker and marked as SOLVED, so that I don't have to manually update them.

#### Acceptance Criteria

1. WHEN a Submission's `titleSlug` matches the `slug` field of a Problem in the problems collection, THE Sync_Service SHALL upsert a UserProblem record for that user and problem with `status` set to `SOLVED`.
2. WHEN the Sync_Service upserts a UserProblem record to `SOLVED` and the record did not previously have a `solvedAt` date, THE Sync_Service SHALL set the `solvedAt` field to the submission timestamp returned by LeetCode.
3. IF a Submission's timestamp is absent or null, THEN THE Sync_Service SHALL set the `solvedAt` field to the sync's `startedAt` timestamp.
4. IF a UserProblem record already has `status` equal to `SOLVED`, THEN THE Sync_Service SHALL NOT overwrite the existing `solvedAt` date.
5. WHEN a Submission's `titleSlug` does not match any Problem in the problems collection, THE Sync_Service SHALL skip that Submission without producing an error.
6. IF a UserProblem record has `status` ATTEMPTED or TODO and a matching Submission is found, THEN THE Sync_Service SHALL update the `status` to `SOLVED` and set a `source` field to `LEETCODE_SYNC`.
7. THE Sync_Service SHALL record the count of problems whose status transitioned to SOLVED in this sync (from any previously non-SOLVED status) in the Sync_Record for that sync execution.

---

### Requirement 6: Sync Record Persistence

**User Story:** As a user, I want each sync attempt to be recorded, so that I can see when the last sync occurred and whether it succeeded.

#### Acceptance Criteria

1. WHEN a sync is initiated, THE Sync_Service SHALL create a Sync_Record document with `status` set to `IN_PROGRESS` and a `startedAt` timestamp.
2. WHEN a sync completes successfully, THE Sync_Service SHALL update the Sync_Record with `status` set to `COMPLETED`, a `completedAt` timestamp, the number of problems newly marked as SOLVED, and the fetched Stats.
3. IF a sync fails at any stage, THEN THE Sync_Service SHALL update the Sync_Record with `status` set to `FAILED`, a `completedAt` timestamp, and an `error` field that identifies the stage at which failure occurred (FETCH_STATS, FETCH_SUBMISSIONS, CROSS_REFERENCE, PERSIST) and the failure reason (e.g., TIMEOUT, HTTP_ERROR, INVALID_RESPONSE, DB_ERROR).
4. IF creating a new Sync_Record would cause the total count for that user to exceed 10, THEN THE Sync_Service SHALL delete the oldest Sync_Record (by `startedAt`) before inserting the new one.

---

### Requirement 7: Sync Status Display on Dashboard

**User Story:** As a user, I want to see when my LeetCode data was last synced on my dashboard, so that I know how current my synced data is.

#### Acceptance Criteria

1. IF a user has at least one Sync_Record with `status` equal to `COMPLETED`, THEN THE Dashboard SHALL display a "Last synced {relative time} ago" label next to the sync button, where relative time is expressed as whole units (e.g., "2 minutes ago", "1 hour ago"), using "just now" for elapsed time under 60 seconds.
2. IF a user has no completed Sync_Record, THEN THE Dashboard SHALL display "Never synced" as the sync status label.
3. IF the most recent Sync_Record overall has `status` equal to `FAILED`, THEN THE Dashboard SHALL display "Last sync failed" alongside the relative time of the attempt; if the most recent Sync_Record is `COMPLETED`, THE Dashboard SHALL display the COMPLETED label even if older records have `status` FAILED.
4. WHEN a sync completes, THE Dashboard SHALL update the sync status label within 2 seconds without requiring a full page reload.

---

### Requirement 8: LeetCode Stats Display on Dashboard

**User Story:** As a user, I want to see my LeetCode-sourced solved counts displayed on my dashboard, so that I can compare my LeetCode activity with my in-app tracked progress.

#### Acceptance Criteria

1. IF the most recent Sync_Record has `status` equal to `COMPLETED`, THEN THE Dashboard SHALL display the LeetCode total solved count, easy solved count, medium solved count, and hard solved count sourced from that Sync_Record (using the most recent `completedAt` timestamp).
2. IF no completed Sync_Record exists for a user, THEN THE Dashboard SHALL NOT display LeetCode stat cards.
3. WHILE a sync is IN_PROGRESS, THE Dashboard SHALL continue to display the stats from the most recent COMPLETED Sync_Record (if one exists).
4. THE Dashboard SHALL render LeetCode-sourced stats under a visible section heading labelled "LeetCode Stats", separate from the in-app stats section.

---

### Requirement 9: Optional Background Sync via Cron Job

**User Story:** As a user who has enabled automatic sync, I want my LeetCode data to be refreshed periodically without manual action, so that my progress stays up to date automatically.

#### Acceptance Criteria

1. WHEN the cron job executes, THE Sync_Service SHALL process only users who have a saved `leetcodeUsername` and have `leetcodeSyncEnabled` set to `true`, and SHALL trigger a sync for each such user.
2. IF a user's most recent Sync_Record has a `startedAt` timestamp less than 60 minutes before the cron execution time, THEN THE Sync_Service SHALL skip that user for the current cron run.
3. IF an automated sync for a user fails, THEN THE Sync_Service SHALL record the failure in the Sync_Record and continue processing the remaining users in that cron job execution without aborting.
4. THE Profile_Settings SHALL display a toggle labelled "Enable automatic sync" that controls the `leetcodeSyncEnabled` field on the User_Profile.
5. WHEN the Profile_Settings page loads, THE "Enable automatic sync" toggle SHALL reflect the current value of `leetcodeSyncEnabled` in the User_Profile.
6. WHEN a user toggles "Enable automatic sync" and saves, THE Profile_Settings SHALL display a confirmation toast ("Automatic sync enabled" or "Automatic sync disabled").

---

### Requirement 10: Error Handling and Resilience

**User Story:** As a user, I want the sync feature to handle LeetCode API failures gracefully, so that a sync failure does not disrupt my existing in-app progress data.

#### Acceptance Criteria

1. IF the LeetCode_Client encounters a network error (connection failure, DNS resolution failure, or timeout), THEN THE Sync_Service SHALL mark the Sync_Record as `FAILED`.
2. IF the LeetCode_Client encounters a network error, THEN THE Sync_Service SHALL NOT modify any existing UserProblem records.
3. WHEN the sync API endpoint receives a request from an unauthenticated user, THE Sync_Service SHALL return an HTTP 401 status code without initiating any sync operations.
4. WHEN the sync API endpoint receives a request for a userId that does not match the authenticated session, THE Sync_Service SHALL return an HTTP 403 status code without initiating any sync operations.
5. THE Sync_Service SHALL apply all problem-status upserts for a single sync as an atomic batch operation.
6. IF any upsert in the batch fails, THEN THE Sync_Service SHALL roll back all upserts in that batch and mark the Sync_Record as `FAILED`.
7. IF the LeetCode_Client receives a 4xx or 5xx response during any phase of sync, THEN THE Sync_Service SHALL mark the Sync_Record as `FAILED` with the HTTP status code, and SHALL NOT modify any UserProblem records.
8. WHEN a sync fails, THE Dashboard SHALL display a toast notification stating "Sync failed. Please try again later." and the toast SHALL remain visible for at least 4 seconds.

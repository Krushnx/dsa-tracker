/**
 * DSA Tracker — Problem Seed Script
 *
 * Reads Leetcode-data.csv from the project root and upserts every
 * problem into the MongoDB `problems` collection.
 *
 * Usage:
 *   npm run seed
 *
 * Safe to run multiple times — uses upsert on leetcodeId so no duplicates.
 */

import path from "path";
import fs from "fs";
import { parse } from "csv-parse";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load .env before anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env");
  process.exit(1);
}

// ─── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Inline Problem schema (avoids Next.js module resolution issues) ──────────

interface ProblemRow {
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  link: string;
  topics: string[];
  acceptanceRate: number;
  premiumOnly: boolean;
  category: string;
  likes: number;
  dislikes: number;
}

const ProblemSchema = new mongoose.Schema(
  {
    leetcodeId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    link: { type: String, required: true },
    topics: { type: [String], default: [] },
    acceptanceRate: { type: Number, default: 0 },
    premiumOnly: { type: Boolean, default: false },
    category: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCSV(filePath: string): Promise<ProblemRow[]> {
  return new Promise((resolve, reject) => {
    const rows: ProblemRow[] = [];

    const parser = parse({
      columns: true,        // use first row as headers
      skip_empty_lines: true,
      trim: true,
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        const id = parseInt(record["ID"], 10);
        const title = (record["Title"] ?? "").trim();

        // Skip rows with invalid data
        if (isNaN(id) || !title) continue;

        const rawTopics = (record["Topics"] ?? "").trim();
        const topics = rawTopics
          ? rawTopics.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [];

        const difficulty = record["Difficulty"]?.trim();
        if (!["Easy", "Medium", "Hard"].includes(difficulty)) continue;

        rows.push({
          leetcodeId: id,
          title,
          slug: toSlug(title),
          difficulty: difficulty as "Easy" | "Medium" | "Hard",
          link: (record["Link"] ?? "").trim(),
          topics,
          acceptanceRate: parseFloat(record["Acceptance Rate (%)"] ?? "0") || 0,
          premiumOnly: record["Premium Only"]?.trim().toLowerCase() === "true",
          category: (record["Category"] ?? "").trim(),
          likes: parseInt(record["Likes"] ?? "0", 10) || 0,
          dislikes: parseInt(record["Dislikes"] ?? "0", 10) || 0,
        });
      }
    });

    parser.on("error", reject);
    parser.on("end", () => resolve(rows));

    fs.createReadStream(filePath).pipe(parser);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = path.resolve(process.cwd(), "Leetcode-data.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`❌  CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log("📂  Reading CSV...");
  const rows = await parseCSV(csvPath);
  console.log(`✅  Parsed ${rows.length} problems from CSV`);

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string, { bufferCommands: false });
  console.log("✅  Connected to MongoDB");

  const Problem =
    mongoose.models.Problem ?? mongoose.model("Problem", ProblemSchema);

  // Batch upsert for performance
  const BATCH_SIZE = 200;
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const ops = batch.map((row) => ({
      updateOne: {
        filter: { leetcodeId: row.leetcodeId },
        update: { $set: row },
        upsert: true,
      },
    }));

    const result = await Problem.bulkWrite(ops, { ordered: false });
    inserted += result.upsertedCount;
    updated += result.modifiedCount;

    const done = Math.min(i + BATCH_SIZE, rows.length);
    process.stdout.write(`\r⏳  Processed ${done} / ${rows.length}`);
  }

  console.log(`\n\n🎉  Seed complete!`);
  console.log(`   Inserted : ${inserted}`);
  console.log(`   Updated  : ${updated}`);
  console.log(`   Total    : ${rows.length}`);

  await mongoose.disconnect();
  console.log("🔌  Disconnected from MongoDB");
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});

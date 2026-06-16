import "dotenv/config";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { parse } from "csv-parse/sync";

// ─── Inline model (can't import next.js models outside the app) ───────────────

const CompanyProblemSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    companySlug: { type: String, required: true, lowercase: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", default: null },
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true },
    frequency: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    link: { type: String, default: "" },
    topics: { type: [String], default: [] },
    timeframe: {
      type: String,
      enum: ["30days", "3months", "6months", "6months+", "all"],
      required: true,
    },
  },
  { timestamps: true }
);
CompanyProblemSchema.index({ companySlug: 1, title: 1, timeframe: 1 }, { unique: true });

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: String,
  link: String,
  leetcodeId: Number,
});

const CompanyProblem =
  mongoose.models.CompanyProblem ??
  mongoose.model("CompanyProblem", CompanyProblemSchema);

const Problem =
  mongoose.models.Problem ??
  mongoose.model("Problem", ProblemSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function capitalizeDifficulty(raw: string): string {
  const lower = raw.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const FILENAME_TO_TIMEFRAME: Record<string, string> = {
  "1. Thirty Days.csv": "30days",
  "2. Three Months.csv": "3months",
  "3. Six Months.csv": "6months",
  "4. More Than Six Months.csv": "6months+",
  "5. All.csv": "all",
};

interface CsvRow {
  Difficulty: string;
  Title: string;
  Frequency: string;
  "Acceptance Rate": string;
  Link: string;
  Topics: string;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected.\n");

  const companiesDir = path.join(process.cwd(), "companies");
  const companyFolders = fs
    .readdirSync(companiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  // Build title → ObjectId map from Problems collection
  console.log("Building problem title map...");
  const allProblems = await Problem.find({}).select("_id title").lean() as Array<{ _id: mongoose.Types.ObjectId; title: string }>;
  const problemMap = new Map<string, mongoose.Types.ObjectId>();
  for (const p of allProblems) {
    problemMap.set(p.title.toLowerCase().trim(), p._id);
  }
  console.log(`  Found ${problemMap.size} problems in DB.\n`);

  let totalUpserted = 0;

  for (const folderName of companyFolders) {
    const companyName = folderName;
    const companySlug = toSlug(companyName);
    const folderPath = path.join(companiesDir, folderName);

    const csvFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith(".csv"));
    const ops: mongoose.AnyBulkWriteOperation[] = [];

    for (const csvFile of csvFiles) {
      const timeframe = FILENAME_TO_TIMEFRAME[csvFile];
      if (!timeframe) continue;

      const content = fs.readFileSync(path.join(folderPath, csvFile), "utf-8");

      let rows: CsvRow[];
      try {
        rows = parse(content, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }) as CsvRow[];
      } catch {
        console.warn(`  ⚠ Could not parse ${csvFile} for ${companyName}`);
        continue;
      }

      for (const row of rows) {
        const title = (row.Title ?? "").trim();
        if (!title) continue;

        const difficulty = capitalizeDifficulty(row.Difficulty ?? "");
        const frequency = parseFloat(row.Frequency ?? "0") || 0;
        const acceptanceRate = parseFloat(row["Acceptance Rate"] ?? "0") || 0;
        const link = (row.Link ?? "").trim();
        const topics = (row.Topics ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        const problemId = problemMap.get(title.toLowerCase().trim()) ?? null;

        ops.push({
          updateOne: {
            filter: { companySlug, title, timeframe },
            update: {
              $set: {
                companyName,
                companySlug,
                problemId,
                title,
                difficulty,
                frequency,
                acceptanceRate,
                link,
                topics,
                timeframe,
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (ops.length > 0) {
      const result = await CompanyProblem.bulkWrite(ops, { ordered: false });
      const count = (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
      totalUpserted += count;
      console.log(
        `✓ ${companyName} — ${ops.length} entries processed (${result.upsertedCount} new, ${result.modifiedCount} updated)`
      );
    } else {
      console.log(`  ${companyName} — no data`);
    }
  }

  console.log(`\nDone! Total records processed: ${totalUpserted}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

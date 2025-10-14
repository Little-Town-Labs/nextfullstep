import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "typeorm";
import { BigFiveResultEntity } from "@/entities/BigFiveResultEntity";
import { Readable } from "stream";
import csv from "csv-parser";

// Helper: List of main Big Five categories
const MAIN_CATEGORIES = [
  "Neuroticism",
  "Extraversion",
  "Openness To Experience",
  "Agreeableness",
  "Conscientiousness",
];

// Helper: Parse CSV from a stream and return rows as objects
async function parseCSV(stream: Readable): Promise<{ category: string; score: number }[]> {
  return new Promise((resolve, reject) => {
    const results: { category: string; score: number }[] = [];
    stream
      .pipe(csv())
      .on("data", (data: { [key: string]: string }) => {
        if (data.category && data.You) {
          results.push({
            category: data.category.trim(),
            score: parseInt(data.You, 10),
          });
        }
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Helper: Determine if the file is main or subcategory by checking the first row
function detectResultType(rows: { category: string }[]): "category" | "subcategory" {
  if (rows.length === 0) return "category";
  return MAIN_CATEGORIES.includes(rows[0].category) ? "category" : "subcategory";
}

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    // Get all files (support both "files" and fallback to "file" for backward compatibility)
    const files: File[] = [];
    const filesField = formData.getAll("files");
    if (filesField && filesField.length > 0) {
      for (const f of filesField) {
        if (f instanceof File) files.push(f);
      }
    } else {
      const singleFile = formData.get("file");
      if (singleFile instanceof File) files.push(singleFile);
    }
    const userTestId = formData.get("userTestId") as string;
    // TODO: Replace this with extraction from session/JWT when auth is implemented
    const userId = formData.get("userId") as string;

    if (!files.length || !userTestId || !userId) {
      return NextResponse.json({ error: "Missing files, userTestId, or userId" }, { status: 400 });
    }

    const repo = getRepository(BigFiveResultEntity);
    let totalRows = 0;
    const fileResults: { fileName: string; count: number; resultType: string }[] = [];

    for (const file of files) {
      // Parse CSV
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);
      const rows = await parseCSV(stream);

      if (rows.length === 0) {
        fileResults.push({ fileName: file.name, count: 0, resultType: "invalid" });
        continue;
      }

      // Detect result type
      const resultType = detectResultType(rows);

      // Insert each row into the database
      for (const row of rows) {
        const entity = repo.create({
          category: row.category,
          score: row.score,
          userTestId,
          userId,
          resultType,
        });
        await repo.save(entity);
      }
      totalRows += rows.length;
      fileResults.push({ fileName: file.name, count: rows.length, resultType });
    }

    return NextResponse.json({ success: true, totalRows, fileResults });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 });
  }
}
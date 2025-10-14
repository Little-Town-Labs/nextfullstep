import { NextRequest, NextResponse } from "next/server";
import { DataSource } from "typeorm";
import { BigFiveResultEntity } from "@/entities/BigFiveResultEntity";

// Helper: List of main Big Five categories
const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [BigFiveResultEntity],
  migrations: [],
  subscribers: [],
});

const MAIN_CATEGORIES = [
  "Neuroticism",
  "Extraversion",
  "Openness To Experience",
  "Agreeableness",
  "Conscientiousness",
];

// Helper: Parse CSV content directly
function parseCSV(content: string): { category: string; score: number }[] {
  const results: { category: string; score: number }[] = [];
  
  // Split by lines and process each line
  const lines = content.split(/\r?\n/);
  
  // Skip header row (first line)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split by comma
    const parts = line.split(',');
    if (parts.length >= 2) {
      const category = parts[0].trim();
      const scoreStr = parts[1].trim();
      
      // Parse score as integer
      const score = parseInt(scoreStr, 10);
      
      if (category && !isNaN(score)) {
        results.push({ category, score });
      }
    }
  }
  
  return results;
}

// Helper: Determine if the file is main or subcategory by checking the first row
function detectResultType(rows: { category: string }[]): "category" | "subcategory" {
  if (rows.length === 0) return "category";
  return MAIN_CATEGORIES.includes(rows[0].category) ? "category" : "subcategory";
}

export async function POST(req: NextRequest) {
  try {
    // Get all files (support both "files" and fallback to "file" for backward compatibility)
    const formData = await req.formData();
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

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(BigFiveResultEntity);
    let totalRows = 0;
    const fileResults: { fileName: string; count: number; resultType: string }[] = [];

    for (const file of files) {
      // Read file content as text
      let buffer = Buffer.from(await file.arrayBuffer());
      
      // Handle different encodings
      let content = "";
      
      // Try to detect UTF-16LE BOM (0xFF 0xFE)
      if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString("utf16le");
      } else {
        // Try UTF-8 (with or without BOM)
        content = buffer.toString("utf8");
        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }
      }
      
      console.log(`File ${file.name} content (first 100 chars):`, content.substring(0, 100));
      
      // Parse CSV content
      const rows = parseCSV(content);

      // Debug: log the keys of the first row if present
      if (rows.length > 0) {
        console.log(`First row keys for file ${file.name}:`, Object.keys(rows[0]));
      } else {
        console.log(`No rows parsed for file ${file.name}`);
      }

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
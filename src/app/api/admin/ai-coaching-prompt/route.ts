import { NextRequest, NextResponse } from "next/server";
import { DataSource } from "typeorm";
import { AICoachingPromptEntity } from "@/entities/AICoachingPromptEntity";

// DataSource config (reuse pattern from other API routes)
const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [AICoachingPromptEntity],
  migrations: [],
  subscribers: [],
});

// Helper: check if user is admin (placeholder, replace with real auth)
function isAdmin(req: NextRequest): boolean {
  // TODO: Replace with real authentication/authorization
  const adminHeader = req.headers.get("x-admin");
  return adminHeader === "true";
}

// GET: Retrieve the current coaching prompt
export async function GET(req: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(AICoachingPromptEntity);
    const latest = await repo.findOne({
      order: { updatedAt: "DESC" },
    });
    if (!latest) {
      return NextResponse.json({
        prompt: "Welcome to AI Coaching! Please configure your custom prompt.",
        updatedAt: null,
        updatedBy: null,
      });
    }
    return NextResponse.json({
      prompt: latest.prompt,
      updatedAt: latest.updatedAt,
      updatedBy: latest.updatedBy,
    });
  } catch (error) {
    console.error("Failed to retrieve AI coaching prompt:", error);
    return NextResponse.json({ error: "Failed to retrieve prompt" }, { status: 500 });
  }
}

// POST: Update the coaching prompt (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(AICoachingPromptEntity);
    const body = await req.json();
    const { prompt, updatedBy } = body;
    if (!prompt || !updatedBy) {
      return NextResponse.json({ error: "Missing prompt or updatedBy" }, { status: 400 });
    }
    const entity = repo.create({ prompt, updatedBy });
    await repo.save(entity);
    return NextResponse.json({ success: true, prompt: entity.prompt, updatedAt: entity.updatedAt, updatedBy: entity.updatedBy });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}
import "reflect-metadata";
import { initializeDatabase, getRepository } from "../lib/data-source";
import { AIModelConfigEntity } from "../entities/AIModelConfigEntity";
import { PREDEFINED_MODELS } from "../lib/ai-config";

/**
 * Seed AI Model Configurations
 *
 * Populates the database with predefined AI models from OpenRouter
 * Run with: npx tsx src/scripts/seed-ai-models.ts
 */

async function seedAIModels() {
  console.log("🌱 Starting AI Models seed...");

  try {
    // Initialize database
    await initializeDatabase();
    console.log("✅ Database initialized");

    const modelRepo = await getRepository(AIModelConfigEntity);

    // Check if models already exist
    const existingCount = await modelRepo.count();
    if (existingCount > 0) {
      console.log(
        `⚠️  Found ${existingCount} existing models. Do you want to continue? (This will skip duplicates)`
      );
      // In production, you might want to prompt for confirmation
    }

    // Seed each predefined model
    let createdCount = 0;
    let skippedCount = 0;

    for (const [modelId, config] of Object.entries(PREDEFINED_MODELS)) {
      // Check if model already exists
      const existing = await modelRepo.findOne({ where: { modelId } });

      if (existing) {
        console.log(`⏭️  Skipping existing model: ${config.displayName}`);
        skippedCount++;
        continue;
      }

      // Create new model
      const model = modelRepo.create({
        modelId,
        provider: config.provider,
        displayName: config.displayName,
        description: config.description,
        isEnabled: true,
        isDefault: modelId === "openai/gpt-4o-mini", // Set GPT-4o Mini as default
        costPer1kInputTokens: config.costPer1MInputTokens,
        costPer1kOutputTokens: config.costPer1MOutputTokens,
        maxTokens: config.maxTokens,
        temperature: 0.7,
        maxOutputTokens: 3000,
        capabilities: {
          assessments: true,
          coaching: true,
          streaming: false,
          functionCalling: false,
        },
        status: "active",
        usageCount: 0,
      });

      await modelRepo.save(model);
      console.log(`✅ Created model: ${config.displayName} (${modelId})`);
      createdCount++;
    }

    console.log("\n🎉 AI Models seed completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${createdCount} models`);
    console.log(`   - Skipped: ${skippedCount} models (already exist)`);
    console.log(`   - Total in database: ${await modelRepo.count()} models`);

    // Show the default model
    const defaultModel = await modelRepo.findOne({
      where: { isDefault: true },
    });
    if (defaultModel) {
      console.log(
        `\n⭐ Default model: ${defaultModel.displayName} (${defaultModel.modelId})`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding AI models:", error);
    process.exit(1);
  }
}

// Run the seed function
seedAIModels();

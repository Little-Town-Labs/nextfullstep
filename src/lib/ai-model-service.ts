import { getRepository } from './data-source';
import { AIModelConfigEntity } from '@/entities/AIModelConfigEntity';
import { AIUsageLogEntity } from '@/entities/AIUsageLogEntity';
import { DEFAULT_MODEL_ID, PREDEFINED_MODELS } from './ai-config';

/**
 * AI Model Service
 * Manages AI model configurations and usage tracking
 */

// In-memory cache for model configurations (5 minute TTL)
let modelCache: AIModelConfigEntity[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all enabled AI models
 * Results are cached for performance
 */
export async function getEnabledModels(): Promise<AIModelConfigEntity[]> {
  const now = Date.now();

  // Return cached models if still valid
  if (modelCache && (now - cacheTimestamp) < CACHE_TTL) {
    return modelCache.filter(m => m.isEnabled);
  }

  // Fetch from database
  const repo = await getRepository(AIModelConfigEntity);
  const models = await repo.find({
    where: { isEnabled: true },
    order: { displayName: 'ASC' },
  });

  // Update cache
  modelCache = models as AIModelConfigEntity[];
  cacheTimestamp = now;

  return models as AIModelConfigEntity[];
}

/**
 * Get all AI models (including disabled ones)
 * Used by admin panel
 */
export async function getAllModels(): Promise<AIModelConfigEntity[]> {
  const repo = await getRepository(AIModelConfigEntity);
  const models = await repo.find({
    order: { displayName: 'ASC' },
  });
  return models as AIModelConfigEntity[];
}

/**
 * Get the default model for assessments
 * Falls back to env variable if no default is set in database
 */
export async function getDefaultModel(): Promise<AIModelConfigEntity | null> {
  const repo = await getRepository(AIModelConfigEntity);

  // Try to find the default model in database
  const defaultModel = await repo.findOne({
    where: { isDefault: true, isEnabled: true },
  });

  if (defaultModel) {
    return defaultModel as AIModelConfigEntity;
  }

  // Fallback to environment variable
  const fallbackModel = await repo.findOne({
    where: { modelId: DEFAULT_MODEL_ID, isEnabled: true },
  });

  return fallbackModel as AIModelConfigEntity | null;
}

/**
 * Get a specific model by ID
 */
export async function getModelById(id: string): Promise<AIModelConfigEntity | null> {
  const repo = await getRepository(AIModelConfigEntity);
  const model = await repo.findOne({ where: { id } });
  return model as AIModelConfigEntity | null;
}

/**
 * Get a specific model by modelId (e.g., "openai/gpt-4o-mini")
 */
export async function getModelByModelId(modelId: string): Promise<AIModelConfigEntity | null> {
  const repo = await getRepository(AIModelConfigEntity);
  const model = await repo.findOne({ where: { modelId } });
  return model as AIModelConfigEntity | null;
}

/**
 * Create a new AI model configuration
 */
export async function createModel(
  data: Partial<AIModelConfigEntity>
): Promise<AIModelConfigEntity> {
  const repo = await getRepository(AIModelConfigEntity);

  const model = repo.create(data);
  const savedModel = await repo.save(model);

  // Invalidate cache
  modelCache = null;

  return savedModel as AIModelConfigEntity;
}

/**
 * Update an existing AI model configuration
 */
export async function updateModel(
  id: string,
  data: Partial<AIModelConfigEntity>
): Promise<AIModelConfigEntity | null> {
  const repo = await getRepository(AIModelConfigEntity);

  const model = await repo.findOne({ where: { id } });
  if (!model) return null;

  // If setting this model as default, unset all others
  if (data.isDefault === true) {
    await repo.update({ isDefault: true }, { isDefault: false });
  }

  Object.assign(model, data);
  const updatedModel = await repo.save(model);

  // Invalidate cache
  modelCache = null;

  return updatedModel as AIModelConfigEntity;
}

/**
 * Delete an AI model configuration
 */
export async function deleteModel(id: string): Promise<boolean> {
  const repo = await getRepository(AIModelConfigEntity);

  const result = await repo.delete(id);

  // Invalidate cache
  modelCache = null;

  return (result.affected ?? 0) > 0;
}

/**
 * Set a model as the default
 */
export async function setDefaultModel(id: string): Promise<boolean> {
  const repo = await getRepository(AIModelConfigEntity);

  // First, unset all defaults
  await repo.update({ isDefault: true }, { isDefault: false });

  // Then set the new default
  const result = await repo.update({ id }, { isDefault: true });

  // Invalidate cache
  modelCache = null;

  return (result.affected ?? 0) > 0;
}

/**
 * Toggle model enabled/disabled state
 */
export async function toggleModelEnabled(id: string): Promise<AIModelConfigEntity | null> {
  const repo = await getRepository(AIModelConfigEntity);

  const model = await repo.findOne({ where: { id } });
  if (!model) return null;

  model.isEnabled = !model.isEnabled;
  const updatedModel = await repo.save(model);

  // Invalidate cache
  modelCache = null;

  return updatedModel as AIModelConfigEntity;
}

/**
 * Log AI usage for analytics
 */
export async function logAIUsage(data: {
  userId: string;
  modelId: string;
  provider: string;
  requestType: string;
  relatedEntityId?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost?: number;
  latencyMs?: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
}): Promise<AIUsageLogEntity> {
  const repo = await getRepository(AIUsageLogEntity);

  const log = repo.create(data);
  const savedLog = await repo.save(log);

  // Update model usage count and last used timestamp
  const modelRepo = await getRepository(AIModelConfigEntity);
  const model = await modelRepo.findOne({ where: { modelId: data.modelId } });

  if (model) {
    const typedModel = model as AIModelConfigEntity;
    typedModel.usageCount += 1;
    typedModel.lastUsedAt = new Date();
    await modelRepo.save(typedModel);
  }

  return savedLog as AIUsageLogEntity;
}

/**
 * Get usage statistics for analytics
 */
export async function getUsageStats(options: {
  userId?: string;
  modelId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const repo = await getRepository(AIUsageLogEntity);

  const query = repo.createQueryBuilder('log');

  if (options.userId) {
    query.andWhere('log.userId = :userId', { userId: options.userId });
  }

  if (options.modelId) {
    query.andWhere('log.modelId = :modelId', { modelId: options.modelId });
  }

  if (options.startDate) {
    query.andWhere('log.createdAt >= :startDate', { startDate: options.startDate });
  }

  if (options.endDate) {
    query.andWhere('log.createdAt <= :endDate', { endDate: options.endDate });
  }

  query.orderBy('log.createdAt', 'DESC');

  if (options.limit) {
    query.take(options.limit);
  }

  return query.getMany();
}

/**
 * Get aggregate usage statistics
 */
export async function getAggregateUsageStats(options: {
  startDate?: Date;
  endDate?: Date;
}) {
  const repo = await getRepository(AIUsageLogEntity);

  const query = repo.createQueryBuilder('log')
    .select('log.modelId', 'modelId')
    .addSelect('log.provider', 'provider')
    .addSelect('COUNT(*)', 'requestCount')
    .addSelect('SUM(log.totalTokens)', 'totalTokens')
    .addSelect('SUM(log.estimatedCost)', 'totalCost')
    .addSelect('AVG(log.latencyMs)', 'avgLatency')
    .groupBy('log.modelId')
    .addGroupBy('log.provider');

  if (options.startDate) {
    query.andWhere('log.createdAt >= :startDate', { startDate: options.startDate });
  }

  if (options.endDate) {
    query.andWhere('log.createdAt <= :endDate', { endDate: options.endDate });
  }

  return query.getRawMany();
}

/**
 * Clear model cache (call this after admin changes)
 */
export function clearModelCache() {
  modelCache = null;
}

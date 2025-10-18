import { createOpenAI } from '@ai-sdk/openai';

/**
 * OpenRouter Configuration for Vercel AI SDK
 *
 * OpenRouter provides a unified API for multiple LLM providers.
 * We use the OpenAI provider with a custom baseURL to connect to OpenRouter.
 *
 * Supported providers through OpenRouter:
 * - OpenAI (gpt-4o, gpt-4o-mini, etc.)
 * - Anthropic (claude-3.5-sonnet, claude-3-haiku, etc.)
 * - Google (gemini-pro, gemini-flash, etc.)
 * - Meta (llama-3.1-70b-instruct, etc.)
 * - And many more...
 */

// Initialize OpenRouter client using OpenAI SDK with custom baseURL
export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  // Optional: Add custom headers for better tracking
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'NextFullStep Career Platform',
  },
});

/**
 * Predefined model configurations
 * These can be overridden by database configurations
 *
 * NOTE: All costs are per 1 MILLION tokens (OpenRouter standard)
 */
export const PREDEFINED_MODELS = {
  // OpenAI Models
  'openai/gpt-4o-mini': {
    displayName: 'GPT-4o Mini',
    provider: 'openai',
    costPer1MInputTokens: 0.15,
    costPer1MOutputTokens: 0.60,
    maxTokens: 128000,
    description: 'Fast and cost-effective for most tasks',
  },
  'openai/gpt-4o': {
    displayName: 'GPT-4o',
    provider: 'openai',
    costPer1MInputTokens: 2.50,
    costPer1MOutputTokens: 10.00,
    maxTokens: 128000,
    description: 'Most capable OpenAI model for complex reasoning',
  },

  // Anthropic Models
  'anthropic/claude-3.5-sonnet': {
    displayName: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    costPer1MInputTokens: 3.00,
    costPer1MOutputTokens: 15.00,
    maxTokens: 200000,
    description: 'Best for nuanced analysis and career coaching',
  },
  'anthropic/claude-3-haiku': {
    displayName: 'Claude 3 Haiku',
    provider: 'anthropic',
    costPer1MInputTokens: 0.25,
    costPer1MOutputTokens: 1.25,
    maxTokens: 200000,
    description: 'Fast and affordable for quick assessments',
  },

  // Google Models
  'google/gemini-pro': {
    displayName: 'Gemini Pro',
    provider: 'google',
    costPer1MInputTokens: 0.50,
    costPer1MOutputTokens: 1.50,
    maxTokens: 32000,
    description: 'Google\'s multimodal model',
  },
  'google/gemini-flash': {
    displayName: 'Gemini Flash',
    provider: 'google',
    costPer1MInputTokens: 0.075,
    costPer1MOutputTokens: 0.30,
    maxTokens: 32000,
    description: 'Fastest Google model for quick responses',
  },

  // Meta Models
  'meta-llama/llama-3.1-70b-instruct': {
    displayName: 'Llama 3.1 70B',
    provider: 'meta',
    costPer1MInputTokens: 0.80,
    costPer1MOutputTokens: 0.80,
    maxTokens: 128000,
    description: 'Open source alternative with strong performance',
  },

  // xAI Models
  'x-ai/grok-4-fast': {
    displayName: 'Grok 4 Fast',
    provider: 'xai',
    costPer1MInputTokens: 0.20,
    costPer1MOutputTokens: 0.50,
    maxTokens: 2000000, // 2M context
    description: 'Fast reasoning model with 2M context window',
  },
} as const;

/**
 * Default model for assessments
 * Can be overridden by database configuration
 */
export const DEFAULT_MODEL_ID = process.env.DEFAULT_AI_MODEL || 'openai/gpt-4o-mini';

/**
 * Default generation parameters
 */
export const DEFAULT_GENERATION_PARAMS = {
  temperature: 0.7,
  maxTokens: 3000,
} as const;

/**
 * Check if OpenRouter API key is configured
 */
export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * Get model instance for generation
 * @param modelId - The model ID (e.g., "openai/gpt-4o-mini")
 */
export function getModel(modelId: string) {
  return openrouter(modelId);
}

/**
 * Calculate estimated cost for token usage
 * @param modelId - The model ID
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Estimated cost in USD
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelConfig = PREDEFINED_MODELS[modelId as keyof typeof PREDEFINED_MODELS];
  if (!modelConfig) return 0;

  const inputCost = (inputTokens / 1_000_000) * modelConfig.costPer1MInputTokens;
  const outputCost = (outputTokens / 1_000_000) * modelConfig.costPer1MOutputTokens;

  return inputCost + outputCost;
}

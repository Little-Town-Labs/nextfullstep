'use server';

import { CoreMessage } from 'ai';
import { generateText } from 'ai';
import { getModel, calculateCost, isOpenRouterConfigured } from '@/lib/ai-config';
import { getDefaultModel, logAIUsage } from '@/lib/ai-model-service';

// Career Assessment Analysis
export async function analyzeCareerAssessment(
  roleId: string,
  systemPrompt: string,
  responses: Array<{ question: string; answer: string }>,
  userId?: string,
  assessmentId?: string
) {
  const startTime = Date.now();

  try {
    // Get the default model from database or fallback to env config
    const modelConfig = await getDefaultModel();
    const modelId = modelConfig?.modelId || 'openai/gpt-4o-mini';

    // Build conversation from assessment responses
    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Ready to begin? yes" },
    ];

    // Add each Q&A pair
    responses.forEach((response) => {
      messages.push({ role: "assistant", content: response.question });
      messages.push({ role: "user", content: response.answer });
    });

    // Request final analysis
    messages.push({
      role: "user",
      content:
        "I've answered all 8 questions. Please provide my complete qualification verdict and personalized roadmap now.",
    });

    // Generate text using OpenRouter
    const result = await generateText({
      model: getModel(modelId),
      messages: messages,
      temperature: modelConfig?.temperature || 0.7,
      maxTokens: modelConfig?.maxOutputTokens || 3000,
    });

    // Calculate latency and cost
    const latencyMs = Date.now() - startTime;
    const inputTokens = result.usage?.promptTokens || 0;
    const outputTokens = result.usage?.completionTokens || 0;
    const totalTokens = result.usage?.totalTokens || 0;
    const estimatedCost = calculateCost(modelId, inputTokens, outputTokens);

    // Log usage if userId is provided
    if (userId) {
      await logAIUsage({
        userId,
        modelId,
        provider: modelConfig?.provider || 'openai',
        requestType: 'assessment',
        relatedEntityId: assessmentId,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        latencyMs,
        status: 'success',
      });
    }

    return result.text;
  } catch (error) {
    // Log error if userId is provided
    if (userId) {
      const modelConfig = await getDefaultModel();
      await logAIUsage({
        userId,
        modelId: modelConfig?.modelId || 'openai/gpt-4o-mini',
        provider: modelConfig?.provider || 'openai',
        requestType: 'assessment',
        relatedEntityId: assessmentId,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        latencyMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    throw error;
  }
}

// Utils
export async function checkAIAvailability() {
  return isOpenRouterConfigured();
}
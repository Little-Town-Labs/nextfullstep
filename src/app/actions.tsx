'use server';

import { CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Career Assessment Analysis
export async function analyzeCareerAssessment(
  roleId: string,
  systemPrompt: string,
  responses: Array<{ question: string; answer: string }>
) {
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

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    messages: messages,
    temperature: 0.7,
    maxTokens: 3000,
  });

  return result.text;
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}
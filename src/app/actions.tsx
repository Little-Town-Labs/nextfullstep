'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Weather } from '@/components/weather';
import { generateText } from 'ai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}


// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[]) {
  // Fetch the latest AI coaching prompt from the admin API
  let systemPrompt = "You are an AI coach. Please configure your custom prompt.";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/ai-coaching-prompt`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.prompt) systemPrompt = data.prompt;
    }
  } catch (err) {
    // Fallback to default if fetch fails
  }

  // Prepend the system prompt as the first message
  const fullMessages: CoreMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: fullMessages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: openai('grok3-mini'),
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {
      showWeather: {
        description: 'Show the weather for a given location.',
        parameters: z.object({
          city: z.string().describe('The city to show the weather for.'),
          unit: z
            .enum(['F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          stream.done(<Weather city={city} unit={unit} />);
          return `Here's the weather for ${city}!`; 
        },
      },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join(),
        display: stream.value,
      },
    ],
  };
}

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
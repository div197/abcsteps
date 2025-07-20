/**
 * Example integration for Trimurti Router
 * Demonstrates how to use the intelligent model routing system
 */

import { getTrimurtiRouter, routeToTrimurtiModel } from '@/ai/openrouter-provider';
import { TaskType } from './trimurti-router';
import { streamText } from 'ai';
import { vivek } from '@/ai/providers';

/**
 * Example 1: Direct usage with automatic task classification
 */
export async function handleUserMessage(message: string) {
  const router = getTrimurtiRouter();
  
  // Automatically classify and route the message
  const result = await router.route(message, {
    systemPrompt: 'You are a helpful educational assistant using Socratic dialogue.'
  });

  console.log('Task Type:', result.taskType);
  console.log('Model Tier:', result.tier);
  console.log('Selected Model:', result.model);
  console.log('Response:', result.response);
  console.log('Token Usage:', result.usage);

  return result;
}

/**
 * Example 2: Streaming response with auto-routing
 */
export async function streamUserMessage(message: string) {
  const router = getTrimurtiRouter();
  
  // Get streaming response
  const { stream, model, tier, taskType } = await router.stream(message, {
    systemPrompt: 'You are a helpful educational assistant.'
  });

  console.log('Streaming with model:', model);
  console.log('Task type:', taskType);
  console.log('Model tier:', tier);

  // Process the stream
  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      process.stdout.write(chunk.choices[0].delta.content);
    }
  }
}

/**
 * Example 3: Force specific task type
 */
export async function handleComplexAnalysis(message: string) {
  const router = getTrimurtiRouter();
  
  // Force using Shiva tier for complex analysis
  const result = await router.route(message, {
    forceTaskType: TaskType.COMPLEX,
    systemPrompt: 'Provide a comprehensive analysis with deep insights.'
  });

  return result;
}

/**
 * Example 4: Integration with Vercel AI SDK
 */
export async function useWithVercelAI(message: string) {
  // Get the appropriate model for the task
  const { modelValue, taskType, tier } = await routeToTrimurtiModel(message);
  
  console.log('Auto-selected model:', modelValue);
  console.log('Task type:', taskType);
  console.log('Model tier:', tier);

  // Use with Vercel AI SDK
  const result = await streamText({
    model: vivek(modelValue),
    messages: [
      {
        role: 'system',
        content: 'You are a helpful educational assistant.'
      },
      {
        role: 'user',
        content: message
      }
    ],
  });

  return result;
}

/**
 * Example 5: Using the special auto-routing model
 */
export async function useAutoRoutingModel(message: string) {
  // When using 'trimurti-auto', the system will automatically
  // classify the task and select the appropriate model
  const result = await streamText({
    model: vivek('trimurti-auto'),
    messages: [
      {
        role: 'user',
        content: message
      }
    ],
  });

  return result;
}

/**
 * Example task classifications:
 * 
 * Brahma (Simple):
 * - "Hi, how are you?"
 * - "What is the capital of France?"
 * - "Thank you!"
 * 
 * Vishnu (Balanced):
 * - "Can you help me understand photosynthesis using the Socratic method?"
 * - "Let's explore the concept of democracy together"
 * - "Guide me through solving this algebra problem step by step"
 * 
 * Shiva (Complex):
 * - "Analyze the economic impacts of climate change on developing nations"
 * - "Summarize this 50-page research paper on quantum computing"
 * - "Compare and contrast the philosophical approaches of Kant and Hume"
 */
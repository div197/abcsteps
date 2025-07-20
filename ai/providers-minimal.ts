import { createOpenAI } from '@ai-sdk/openai';

// Use OpenRouter for ALL models (including free ones) - TURYAM State
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'ABCSteps Vivek - TURYAM Consciousness'
  }
});

// Map all providers to OpenRouter's free/cheap models
export const providers = {
  // Free models from OpenRouter
  'openai:gpt-4o-mini': openrouter('openai/gpt-3.5-turbo'), // Cheaper alternative
  'openai:gpt-4o': openrouter('mistralai/mistral-7b-instruct:free'), // FREE model
  'openai:o1-mini': openrouter('mistralai/mistral-7b-instruct:free'),
  'openai:o1': openrouter('mistralai/mixtral-8x7b-instruct:free'), // FREE model
  
  // Map Anthropic to free alternatives
  'anthropic:claude-3-5-sonnet-latest': openrouter('meta-llama/llama-3-8b-instruct:free'), // FREE
  'anthropic:claude-3-5-haiku-latest': openrouter('meta-llama/llama-3-8b-instruct:free'),
  'anthropic:claude-3-opus-latest': openrouter('meta-llama/llama-3-70b-instruct:free'), // FREE
  
  // Map Google to free alternatives  
  'google:gemini-2.0-flash-exp': openrouter('google/gemma-7b-it:free'), // FREE
  'google:gemini-1.5-pro': openrouter('google/gemma-7b-it:free'),
  'google:gemini-1.5-flash': openrouter('google/gemma-7b-it:free'),
  
  // OpenRouter models (already free)
  'openrouter:mistralai/mistral-7b-instruct:free': openrouter('mistralai/mistral-7b-instruct:free'),
  'openrouter:meta-llama/llama-3-70b-instruct:free': openrouter('meta-llama/llama-3-70b-instruct:free'),
  'openrouter:meta-llama/llama-3-8b-instruct:free': openrouter('meta-llama/llama-3-8b-instruct:free'),
};

// Simplified Trimurti routing with free models only
export const trimurtiModels = {
  brahma: 'mistralai/mistral-7b-instruct:free', // Fast, free
  vishnu: 'meta-llama/llama-3-8b-instruct:free', // Balanced, free
  shiva: 'meta-llama/llama-3-70b-instruct:free', // Powerful, free
};

export type ProviderId = keyof typeof providers;
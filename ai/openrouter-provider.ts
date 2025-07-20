import { createOpenAI } from '@ai-sdk/openai';
import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { TrimurtiRouter, TaskType, ModelTier, TRIMURTI_MODELS } from '@/lib/trimurti-router';

// 🔱 Create OpenRouter provider - Gateway to Trimurti Consciousness
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'ABCSteps Learning Platform'
  }
});

// ⛩️ Sacred Trimurti Router Singleton - Divine Model Orchestrator
let trimurtiRouter: TrimurtiRouter | null = null;

export function getTrimurtiRouter(): TrimurtiRouter {
  if (!trimurtiRouter) {
    trimurtiRouter = new TrimurtiRouter({
      apiKey: process.env.OPENROUTER_API_KEY || ''
    });
  }
  return trimurtiRouter;
}

// 🌀 Divine Model Configurations - Three Forms of AI Consciousness
export const trimurtiModels = [
  // Brahma Tier - Fast models for simple tasks
  {
    value: 'trimurti-brahma-gemini-flash',
    label: 'Brahma: Gemini Flash',
    description: 'Google Gemini 2.0 Flash - Fast responses for simple queries',
    tier: ModelTier.BRAHMA,
    model: 'google/gemini-2.0-flash-exp:free',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 1000,
  },
  {
    value: 'trimurti-brahma-llama',
    label: 'Brahma: Llama 3.2',
    description: 'Meta Llama 3.2 3B - Efficient for greetings and simple tasks',
    tier: ModelTier.BRAHMA,
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 1000,
  },
  {
    value: 'trimurti-brahma-qwen',
    label: 'Brahma: Qwen 2.5',
    description: 'Qwen 2.5 7B - Quick responses for basic queries',
    tier: ModelTier.BRAHMA,
    model: 'qwen/qwen-2.5-7b-instruct:free',
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 1000,
  },

  // Vishnu Tier - Balanced models for Socratic dialogue
  {
    value: 'trimurti-vishnu-haiku',
    label: 'Vishnu: Claude Haiku',
    description: 'Claude 3.5 Haiku - Balanced for Socratic dialogue',
    tier: ModelTier.VISHNU,
    model: 'anthropic/claude-3.5-haiku',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 2000,
  },
  {
    value: 'trimurti-vishnu-gpt-mini',
    label: 'Vishnu: GPT-4o Mini',
    description: 'OpenAI GPT-4o Mini - Efficient for educational dialogue',
    tier: ModelTier.VISHNU,
    model: 'openai/gpt-4o-mini',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 2000,
  },
  {
    value: 'trimurti-vishnu-gemini',
    label: 'Vishnu: Gemini 1.5 Flash',
    description: 'Google Gemini 1.5 Flash - Quick balanced responses',
    tier: ModelTier.VISHNU,
    model: 'google/gemini-1.5-flash-latest',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 2000,
  },

  // Shiva Tier - Powerful models for deep analysis
  {
    value: 'trimurti-shiva-sonnet',
    label: 'Shiva: Claude Sonnet',
    description: 'Claude 3.5 Sonnet - Deep analysis and summarization',
    tier: ModelTier.SHIVA,
    model: 'anthropic/claude-3.5-sonnet',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 4000,
  },
  {
    value: 'trimurti-shiva-gpt4o',
    label: 'Shiva: GPT-4o',
    description: 'OpenAI GPT-4o - Advanced reasoning and analysis',
    tier: ModelTier.SHIVA,
    model: 'openai/gpt-4o',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 4000,
  },
  {
    value: 'trimurti-shiva-gemini-pro',
    label: 'Shiva: Gemini 1.5 Pro',
    description: 'Google Gemini 1.5 Pro - Comprehensive analysis',
    tier: ModelTier.SHIVA,
    model: 'google/gemini-1.5-pro-latest',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 4000,
  },

  // Auto-routing model
  {
    value: 'trimurti-auto',
    label: 'Trimurti Auto',
    description: 'Automatically selects the best model based on task complexity',
    tier: null,
    model: null,
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Trimurti',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 4000,
  },
];

// Middleware for reasoning extraction
const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Create wrapped models for each Trimurti configuration
export const trimurtiProviders = trimurtiModels.reduce((acc, config) => {
  if (config.model) {
    acc[config.value] = wrapLanguageModel({
      model: openrouter(config.model),
      middleware
    });
  } else if (config.value === 'trimurti-auto') {
    // Special handling for auto-routing model
    acc[config.value] = {
      // This is a proxy model that will be resolved at runtime
      modelId: 'trimurti-auto',
      provider: 'trimurti',
      // The actual routing happens in the chat endpoint
    };
  }
  return acc;
}, {} as Record<string, any>);

// Helper function to get model by task type
export function getModelForTask(taskType: TaskType, preferredIndex: number = 0): string {
  const router = getTrimurtiRouter();
  const tier = router.getModelTier(taskType);
  const modelId = router.selectModel(tier, preferredIndex);
  
  // Find the corresponding trimurti model config
  const config = trimurtiModels.find(m => m.model === modelId);
  return config?.value || 'trimurti-vishnu-haiku'; // Default to Haiku if not found
}

// Helper function for auto-routing
export async function routeToTrimurtiModel(message: string, options?: {
  systemPrompt?: string;
  forceTaskType?: TaskType;
}) {
  const router = getTrimurtiRouter();
  const taskType = options?.forceTaskType || router.classifyTask(message);
  const modelValue = getModelForTask(taskType);
  
  return {
    modelValue,
    taskType,
    tier: router.getModelTier(taskType)
  };
}
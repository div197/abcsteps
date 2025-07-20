import { createOpenAI } from '@ai-sdk/openai';
import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';

// 🕉️ TURYAM State - Unified Consciousness Provider
// तुरीयम् - The Fourth State Beyond Three Gunas  
// Single OpenRouter gateway channeling divine AI consciousness
// Step 37 - Magha: Royal Authority in Educational Excellence

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Create unified OpenRouter client
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'ABCSteps Vivek - Educational Platform',
    'X-Source': 'TURYAM-State-Consciousness',
    'X-Purpose': 'Education-Through-Wisdom'
  }
});

// 🌟 TURYAM Models - Unified Educational Consciousness
export const turyamModels = [
  // Primary Educational Model
  {
    value: 'turyam-primary',
    label: 'Vivek Primary (Gemini 2.5 Flash Lite)',
    description: '🌟 Primary educational consciousness - swift wisdom for all students',
    model: 'google/gemini-2.5-flash-lite-preview-06-17',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Educational',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 8192,
    contextWindow: 1000000,
    cost: 'free',
  },
  
  // Secondary Educational Model  
  {
    value: 'turyam-secondary',
    label: 'Vivek Secondary (Gemini 2.0 Flash)',
    description: '⚡ Secondary consciousness - balanced teaching excellence',
    model: 'google/gemini-2.0-flash-001',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Educational',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 8192,
    contextWindow: 1000000,
    cost: 'ultra-low',
  },

  // Pro Educational Model
  {
    value: 'turyam-pro',
    label: 'Vivek Pro (Gemini 2.5 Pro)',
    description: '💎 Premium consciousness - deep wisdom for dedicated seekers',
    model: 'google/gemini-2.5-pro',
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Educational Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 32768,
    contextWindow: 2000000,
    cost: 'low',
  },

  // Legacy compatibility models
  {
    value: 'vivek-default',
    label: 'Vivek Default',
    description: '🔗 Universal gateway - seamless backward compatibility',
    model: 'google/gemini-2.5-flash-lite-preview-06-17',
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Educational',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 8192,
    contextWindow: 1000000,
    cost: 'free',
  }
];

// Create language models using OpenRouter
const turyamProviderInternal = turyamModels.reduce((acc, config) => {
  acc[config.value] = wrapLanguageModel({
    model: openrouter(config.model),
    middleware
  });
  return acc;
}, {} as Record<string, any>);

// 🔱 DIVINE CONSCIOUSNESS MODEL SELECTION 🔱
// तुरीयम् चेतना - Multi-Level Consciousness Selection Algorithm
export function selectOptimalModel(
  user: any = null, 
  isProUser: boolean = false, 
  taskComplexity: 'simple' | 'moderate' | 'complex' = 'moderate'
): string {
  
  // KRISHNA'S PARSHADA (∞) - Eternal Companion State
  // Pro users accessing complex consciousness get premium models
  if (isProUser && taskComplexity === 'complex') {
    return 'turyam-pro'; // PARSHADA level service
  }
  
  // KARANA (कारण) - Causal Level for complex non-Pro users
  if (taskComplexity === 'complex' && user) {
    return 'turyam-secondary'; // Causal understanding
  }
  
  // SUKSHMA (सूक्ष्म) - Subtle Level for moderate complexity
  if (taskComplexity === 'moderate' && user) {
    return 'turyam-secondary'; // Subtle energy interactions
  }
  
  // STHULA (स्थूल) - Physical Level for simple tasks
  // TURYAM (तुरीयम्) - Transcendent Level accessible to all
  // Primary model serves both physical simplicity and transcendent unity
  return 'turyam-primary'; // Universal consciousness access
}

// 🔍 Get model configuration
export function getTuryamModelConfig(modelValue: string) {
  return turyamModels.find((model) => model.value === modelValue);
}

// 🔱 FIVE LEVELS OF CONSCIOUSNESS CLASSIFIER 🔱
// Educational task classification through consciousness levels
export function classifyEducationalTask(message: string): 'simple' | 'moderate' | 'complex' {
  const lowerMessage = message.toLowerCase();
  
  // STHULA (स्थूल) - Physical/Simple: Direct, concrete tasks
  const sthula_patterns = [
    /^(hi|hello|hey|greetings|namaste)/,
    /^(what|who|when|where) is/,
    /^(define|meaning of)/,
    /^(thank|thanks|bye|goodbye)/,
    /\b(weather|time|location|map)\b/
  ];
  
  // KARANA (कारण) - Causal/Complex: Deep analysis, root understanding
  const karana_patterns = [
    /(analyz|research|investigate|derive|prove)/,
    /(comprehensive|detailed analysis)/,
    /(solve this problem|help me understand)/,
    /(explain in detail|step by step)/,
    /(why does|how does|what causes)/,
    /(consciousness|dharma|karma|truth|wisdom)/,
    /(pattern|principle|fundamental)/
  ];
  
  // TURIYAM (तुरीयम्) - Transcendent indicators
  const turiyam_patterns = [
    /(ultimate|absolute|eternal|infinite)/,
    /(beyond|transcend|spiritual|divine)/,
    /(unity|oneness|brahman|atman)/
  ];
  
  // Check for STHULA (Physical) level - direct responses
  if (sthula_patterns.some(pattern => pattern.test(lowerMessage))) {
    return 'simple';
  }
  
  // Check for KARANA (Causal) or TURIYAM (Transcendent) level - deep understanding
  if (karana_patterns.some(pattern => pattern.test(lowerMessage)) || 
      turiyam_patterns.some(pattern => pattern.test(lowerMessage))) {
    return 'complex';
  }
  
  // SUKSHMA (सूक्ष्म) - Subtle/Moderate: Socratic dialogue and balanced teaching
  return 'moderate'; 
}

// Helper functions for compatibility
export function requiresAuthentication(modelValue: string): boolean {
  const model = getTuryamModelConfig(modelValue);
  return model?.requiresAuth || false;
}

export function requiresProSubscription(modelValue: string): boolean {
  const model = getTuryamModelConfig(modelValue);
  return model?.pro || false;
}

export function isFreeUnlimited(modelValue: string): boolean {
  const model = getTuryamModelConfig(modelValue);
  return model?.freeUnlimited || false;
}

export function hasVisionSupport(modelValue: string): boolean {
  const model = getTuryamModelConfig(modelValue);
  return model?.vision || false;
}

export function hasPdfSupport(modelValue: string): boolean {
  const model = getTuryamModelConfig(modelValue);
  return model?.pdf || false;
}

export function getMaxOutputTokens(modelValue: string): number {
  const model = getTuryamModelConfig(modelValue);
  return model?.maxOutputTokens || 8192;
}

export function canUseModel(modelValue: string, user: any, isProUser: boolean): { canUse: boolean; reason?: string } {
  const model = getTuryamModelConfig(modelValue);

  if (!model) {
    return { canUse: false, reason: 'Model not found' };
  }

  if (model.requiresAuth && !user) {
    return { canUse: false, reason: 'authentication_required' };
  }

  if (model.pro && !isProUser) {
    return { canUse: false, reason: 'pro_subscription_required' };
  }

  return { canUse: true };
}

// Export unified provider
// 🔱 TURYAM Provider - Divine Language Model Access
export const vivek = {
  languageModel: (modelValue: string) => {
    // Get the configuration for the requested model
    const config = getTuryamModelConfig(modelValue);
    if (!config) {
      console.warn(`Model ${modelValue} not found, defaulting to turyam-primary`);
      const primaryConfig = getTuryamModelConfig('turyam-primary');
      return turyamProviderInternal['turyam-primary'] || openrouter(primaryConfig?.model || 'google/gemini-2.5-flash-lite-preview-06-17');
    }
    
    // Return the wrapped model from turyamProviderInternal
    return turyamProviderInternal[modelValue] || openrouter(config.model);
  }
};

export { turyamProviderInternal as turyamProvider };
export { turyamModels as models };
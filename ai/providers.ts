// 🕉️ ABCSteps Vivek - TURYAM State Providers
// Unified OpenRouter approach for all AI models

import { 
  turyamProvider as vivek,
  turyamModels,
  selectOptimalModel,
  classifyEducationalTask,
  getTuryamModelConfig
} from './providers-unified';

// Re-export for backward compatibility
export { vivek };

// Use unified TURYAM models
export const models = turyamModels;

// Re-export all helper functions from unified provider
export {
  getTuryamModelConfig as getModelConfig,
  requiresAuthentication,
  requiresProSubscription,
  isFreeUnlimited,
  hasVisionSupport,
  hasPdfSupport,
  getMaxOutputTokens,
  canUseModel,
  selectOptimalModel,
  classifyEducationalTask
} from './providers-unified';

// Additional helper functions
export function hasReasoningSupport(modelValue: string): boolean {
  const model = models.find((m) => m.value === modelValue);
  return model?.reasoning || false;
}

export function isExperimentalModel(modelValue: string): boolean {
  const model = models.find((m) => m.value === modelValue);
  return model?.experimental || false;
}

export function shouldBypassRateLimits(modelValue: string, user: any): boolean {
  const model = models.find((m) => m.value === modelValue);
  return Boolean(user && model?.freeUnlimited);
}

export function getAcceptedFileTypes(modelValue: string, isProUser: boolean): string {
  const model = models.find((m) => m.value === modelValue);
  if (model?.pdf && isProUser) {
    return 'image/*,.pdf';
  }
  return 'image/*';
}

// Legacy arrays for backward compatibility
export const authRequiredModels = models.filter((m) => m.requiresAuth).map((m) => m.value);
export const proRequiredModels = models.filter((m) => m.pro).map((m) => m.value);
export const freeUnlimitedModels = models.filter((m) => m.freeUnlimited).map((m) => m.value);

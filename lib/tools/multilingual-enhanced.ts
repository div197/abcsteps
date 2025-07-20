import { tool } from 'ai';
import { z } from 'zod';
import { generateObject } from 'ai';
import { vivek } from '@/ai/providers';

// 🏯 Bharatiya Bhasha Mandal - Sacred Languages of the Motherland
export const INDIAN_LANGUAGES = {
  hi: 'Hindi',
  ta: 'Tamil',
  bn: 'Bengali',
  mr: 'Marathi',
  te: 'Telugu',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  or: 'Odia',
  en: 'English',
} as const;

export type IndianLanguageCode = keyof typeof INDIAN_LANGUAGES;

// 🔍 Lipi Patterns - Sacred Script Recognition Signatures
const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  hi: /[\u0900-\u097F]/,  // Devanagari script (Hindi, Marathi)
  ta: /[\u0B80-\u0BFF]/,  // Tamil script
  bn: /[\u0980-\u09FF]/,  // Bengali script
  te: /[\u0C00-\u0C7F]/,  // Telugu script
  gu: /[\u0A80-\u0AFF]/,  // Gujarati script
  kn: /[\u0C80-\u0CFF]/,  // Kannada script
  ml: /[\u0D00-\u0D7F]/,  // Malayalam script
  pa: /[\u0A00-\u0A7F]/,  // Gurmukhi script (Punjabi)
  or: /[\u0B00-\u0B7F]/,  // Odia script
};

// ✨ Prajna Detection - Swift Script Consciousness Recognition
function detectScriptLanguage(text: string): IndianLanguageCode | null {
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(text)) {
      // Special handling for Devanagari (used by both Hindi and Marathi)
      if (lang === 'hi') {
        // Check for Marathi-specific patterns
        if (/[\u0950]|ऱ|ळ|ऴ/.test(text)) {
          return 'mr';
        }
      }
      return lang as IndianLanguageCode;
    }
  }
  return null;
}

export const multilingualEnhancedTool = tool({
  description: 'Advanced translation tool with automatic language detection for Indian languages and intelligent response generation.',
  parameters: z.object({
    text: z.string().describe('The text to process (can be in any supported Indian language or English).'),
    targetLanguage: z.string().optional().describe('Target language for translation. If not specified, will auto-detect and respond in the same language.'),
    action: z.enum(['translate', 'detect', 'respond']).default('respond').describe('Action to perform: translate, detect language only, or generate response in detected language.'),
  }),
  execute: async ({ text, targetLanguage, action = 'respond' }) => {
    // Quick script-based detection
    const scriptDetected = detectScriptLanguage(text);
    
    // Use AI for more accurate detection and processing
    const { object: result } = await generateObject({
      model: vivek.languageModel('vivek-default'),
      system: `You are an expert in Indian languages and multilingual communication. You can:
1. Accurately detect languages including Hindi, Tamil, Bengali, Marathi, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, and English
2. Translate between these languages fluently
3. Generate contextually appropriate responses in the detected language
4. Understand cultural nuances and provide culturally sensitive translations

Important: When detecting Devanagari script, distinguish between Hindi and Marathi based on vocabulary and context.`,
      prompt: action === 'detect' 
        ? `Detect the language of this text: "${text}"`
        : action === 'translate'
        ? `Translate this text from its original language to ${targetLanguage || 'English'}: "${text}"`
        : `Detect the language of this text and generate an appropriate response in the SAME language: "${text}"`,
      schema: z.object({
        detectedLanguage: z.string().describe('The detected language code (hi, ta, bn, mr, te, gu, kn, ml, pa, or, en)'),
        detectedLanguageName: z.string().describe('Full name of the detected language'),
        confidence: z.number().min(0).max(1).describe('Confidence score of language detection'),
        originalText: z.string().describe('The original input text'),
        translatedText: z.string().optional().describe('Translated text if translation was requested'),
        responseText: z.string().optional().describe('Generated response in the detected language if response was requested'),
        culturalContext: z.string().optional().describe('Any cultural context or nuances to be aware of'),
      }),
    });

    // Enhance with script detection if AI detection has low confidence
    if (result.confidence < 0.8 && scriptDetected) {
      result.detectedLanguage = scriptDetected;
      result.detectedLanguageName = INDIAN_LANGUAGES[scriptDetected];
      result.confidence = Math.max(result.confidence, 0.85);
    }

    console.log('Multilingual processing result:', result);
    
    return {
      ...result,
      action,
      supportedLanguages: Object.entries(INDIAN_LANGUAGES).map(([code, name]) => ({
        code,
        name,
      })),
    };
  },
});

// Helper function to detect user's preferred language from their message history
export async function detectUserLanguagePreference(messages: any[]): Promise<IndianLanguageCode> {
  // Analyze recent messages to detect language patterns
  const recentUserMessages = messages
    .filter(msg => msg.role === 'user')
    .slice(-5)
    .map(msg => msg.content || '')
    .join(' ');

  if (!recentUserMessages) {
    return 'en'; // Default to English
  }

  // Quick detection
  const detected = detectScriptLanguage(recentUserMessages);
  if (detected) {
    return detected;
  }

  // Fallback to AI detection for more complex cases
  const { object: result } = await generateObject({
    model: vivek.languageModel('vivek-nano'),
    prompt: `Detect the primary language from these messages: "${recentUserMessages}"`,
    schema: z.object({
      language: z.enum(['hi', 'ta', 'bn', 'mr', 'te', 'gu', 'kn', 'ml', 'pa', 'or', 'en']),
    }),
  });

  return result.language;
}
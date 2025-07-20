import { generateObject } from 'ai';
import { vivek } from '@/ai/providers';
import { z } from 'zod';
import { INDIAN_LANGUAGES, type IndianLanguageCode } from './tools/multilingual-enhanced';

export interface LanguageDetectionResult {
  language: string;
  languageCode: string;
  confidence: number;
  script?: string;
  alternativeLanguages?: Array<{
    language: string;
    confidence: number;
  }>;
}

// Language detection patterns for common phrases and scripts
const SCRIPT_PATTERNS: Record<string, { pattern: RegExp; script: string }> = {
  hi: { pattern: /[\u0900-\u097F]/, script: 'Devanagari' },
  ta: { pattern: /[\u0B80-\u0BFF]/, script: 'Tamil' },
  bn: { pattern: /[\u0980-\u09FF]/, script: 'Bengali' },
  te: { pattern: /[\u0C00-\u0C7F]/, script: 'Telugu' },
  gu: { pattern: /[\u0A80-\u0AFF]/, script: 'Gujarati' },
  kn: { pattern: /[\u0C80-\u0CFF]/, script: 'Kannada' },
  ml: { pattern: /[\u0D00-\u0D7F]/, script: 'Malayalam' },
  pa: { pattern: /[\u0A00-\u0A7F]/, script: 'Gurmukhi' },
  or: { pattern: /[\u0B00-\u0B7F]/, script: 'Odia' },
  ur: { pattern: /[\u0600-\u06FF]/, script: 'Arabic' },
  as: { pattern: /[\u0980-\u09FF]/, script: 'Bengali' }, // Assamese uses Bengali script
};

// Common words/phrases for language identification
const LANGUAGE_INDICATORS: Record<string, string[]> = {
  hi: ['नमस्ते', 'धन्यवाद', 'कृपया', 'और', 'है', 'में', 'को', 'से', 'का', 'की'],
  ta: ['வணக்கம்', 'நன்றி', 'தயவுசெய்து', 'மற்றும்', 'உள்ளது', 'இல்', 'க்கு', 'இருந்து'],
  bn: ['নমস্কার', 'ধন্যবাদ', 'দয়া করে', 'এবং', 'আছে', 'মধ্যে', 'থেকে'],
  te: ['నమస్తే', 'ధన్యవాదాలు', 'దయచేసి', 'మరియు', 'ఉంది', 'లో', 'నుండి'],
  mr: ['नमस्कार', 'धन्यवाद', 'कृपया', 'आणि', 'आहे', 'मध्ये', 'पासून'],
  gu: ['નમસ્તે', 'આભાર', 'કૃપા કરીને', 'અને', 'છે', 'માં', 'થી'],
  kn: ['ನಮಸ್ತೆ', 'ಧನ್ಯವಾದ', 'ದಯವಿಟ್ಟು', 'ಮತ್ತು', 'ಇದೆ', 'ನಲ್ಲಿ', 'ಇಂದ'],
  ml: ['നമസ്തെ', 'നന്ദി', 'ദയവായി', 'ഒപ്പം', 'ഉണ്ട്', 'ഇൽ', 'നിന്ന്'],
  pa: ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ਧੰਨਵਾਦ', 'ਕਿਰਪਾ ਕਰਕੇ', 'ਅਤੇ', 'ਹੈ', 'ਵਿੱਚ', 'ਤੋਂ'],
  or: ['ନମସ୍କାର', 'ଧନ୍ୟବାଦ', 'ଦୟାକରି', 'ଏବଂ', 'ଅଛି', 'ରେ', 'ରୁ'],
  ur: ['السلام علیکم', 'شکریہ', 'براہ کرم', 'اور', 'ہے', 'میں', 'سے'],
  as: ['নমস্কাৰ', 'ধন্যবাদ', 'অনুগ্ৰহ কৰি', 'আৰু', 'আছে', 'ত', 'পৰা'],
};

/**
 * Quick script-based language detection
 */
function detectScriptAndLanguage(text: string): { languageCode: string | null; script: string | null } {
  // Check for script patterns
  for (const [langCode, { pattern, script }] of Object.entries(SCRIPT_PATTERNS)) {
    if (pattern.test(text)) {
      // Special handling for scripts used by multiple languages
      if (script === 'Devanagari') {
        // Check for Marathi-specific characters
        if (/ऱ|ळ|ऴ/.test(text)) {
          return { languageCode: 'mr', script };
        }
        // Check for common Marathi words
        const marIndicators = LANGUAGE_INDICATORS.mr || [];
        if (marIndicators.some(word => text.includes(word))) {
          return { languageCode: 'mr', script };
        }
        // Default to Hindi for Devanagari
        return { languageCode: 'hi', script };
      }
      
      if (script === 'Bengali') {
        // Check for Assamese-specific patterns
        const asIndicators = LANGUAGE_INDICATORS.as || [];
        if (asIndicators.some(word => text.includes(word))) {
          return { languageCode: 'as', script };
        }
        // Default to Bengali
        return { languageCode: 'bn', script };
      }
      
      return { languageCode: langCode, script };
    }
  }
  
  // Check for English
  if (/^[A-Za-z\s\d\.\,\!\?\-]+$/.test(text.trim())) {
    return { languageCode: 'en', script: 'Latin' };
  }
  
  return { languageCode: null, script: null };
}

/**
 * AI-powered language detection with fallback to script detection
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  // First try quick script-based detection
  const quickDetection = detectScriptAndLanguage(text);
  
  try {
    // Use AI for more accurate detection
    const { object: aiResult } = await generateObject({
      model: vivek.languageModel('vivek-nano'),
      system: `You are an expert linguist specializing in Indian languages. Detect the language of the given text with high accuracy.
Consider:
1. Script type (Devanagari, Tamil, Bengali, etc.)
2. Vocabulary and common words
3. Grammar patterns
4. Distinguish between languages using the same script (e.g., Hindi vs Marathi, Bengali vs Assamese)
5. Return confidence scores for your detection

Supported languages: ${Object.entries(INDIAN_LANGUAGES).map(([code, name]) => `${code}:${name}`).join(', ')}`,
      prompt: `Detect the language of this text: "${text}"`,
      schema: z.object({
        primaryLanguage: z.object({
          code: z.string().describe('Language code (hi, ta, bn, etc.)'),
          name: z.string().describe('Full language name'),
          confidence: z.number().min(0).max(1).describe('Confidence score'),
        }),
        alternativeLanguages: z.array(z.object({
          code: z.string(),
          name: z.string(),
          confidence: z.number().min(0).max(1),
        })).optional().describe('Other possible languages with lower confidence'),
        script: z.string().optional().describe('Script used (Devanagari, Tamil, etc.)'),
      }),
    });
    
    // Combine AI results with script detection for better accuracy
    const finalConfidence = quickDetection.languageCode === aiResult.primaryLanguage.code
      ? Math.min(aiResult.primaryLanguage.confidence * 1.1, 1.0) // Boost confidence if both agree
      : aiResult.primaryLanguage.confidence;
    
    return {
      language: aiResult.primaryLanguage.name,
      languageCode: aiResult.primaryLanguage.code,
      confidence: finalConfidence,
      script: aiResult.script || quickDetection.script || undefined,
      alternativeLanguages: aiResult.alternativeLanguages?.map(alt => ({
        language: alt.name,
        confidence: alt.confidence,
      })),
    };
  } catch (error) {
    console.error('AI language detection failed:', error);
    
    // Fallback to script detection
    if (quickDetection.languageCode) {
      const languageName = INDIAN_LANGUAGES[quickDetection.languageCode as IndianLanguageCode] || 'Unknown';
      return {
        language: languageName,
        languageCode: quickDetection.languageCode,
        confidence: 0.7, // Lower confidence for script-only detection
        script: quickDetection.script || undefined,
      };
    }
    
    // Default to English if all else fails
    return {
      language: 'English',
      languageCode: 'en',
      confidence: 0.5,
      script: 'Latin',
    };
  }
}

/**
 * Batch language detection for multiple texts
 */
export async function detectLanguages(texts: string[]): Promise<LanguageDetectionResult[]> {
  return Promise.all(texts.map(text => detectLanguage(text)));
}

/**
 * Detect language from conversation history
 */
export async function detectConversationLanguage(messages: Array<{ role: string; content: string }>): Promise<LanguageDetectionResult> {
  // Get recent user messages
  const userMessages = messages
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content)
    .filter(Boolean)
    .join(' ');
  
  if (!userMessages) {
    return {
      language: 'English',
      languageCode: 'en',
      confidence: 1.0,
      script: 'Latin',
    };
  }
  
  return detectLanguage(userMessages);
}
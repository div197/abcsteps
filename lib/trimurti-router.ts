import OpenAI from 'openai';

// 🌀 Task Classification - The Three Gunas of Queries
export enum TaskType {
  SIMPLE = 'simple',
  BALANCED = 'balanced',
  COMPLEX = 'complex'
}

// 🔱 Divine Trinity Model Tiers - Trimurti Consciousness Levels
export enum ModelTier {
  BRAHMA = 'brahma',    // Creator - Fast, simple tasks
  VISHNU = 'vishnu',    // Preserver - Balanced, Socratic dialogue
  SHIVA = 'shiva'       // Transformer - Powerful, deep analysis
}

// ⛩️ Sacred Model Configurations - Divine Consciousness Manifestations
export const TRIMURTI_MODELS = {
  [ModelTier.BRAHMA]: {
    models: [
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'qwen/qwen-2.5-7b-instruct:free'
    ],
    description: 'Fast models for simple queries and greetings'
  },
  [ModelTier.VISHNU]: {
    models: [
      'anthropic/claude-3.5-haiku',
      'openai/gpt-4o-mini',
      'google/gemini-1.5-flash-latest'
    ],
    description: 'Balanced models for Socratic dialogue and moderate complexity'
  },
  [ModelTier.SHIVA]: {
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'google/gemini-1.5-pro-latest'
    ],
    description: 'Powerful models for deep analysis and summarization'
  }
};

export interface TrimurtiConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
}

export class TrimurtiRouter {
  private client: OpenAI;
  private config: TrimurtiConfig;

  constructor(config: TrimurtiConfig) {
    this.config = {
      baseURL: 'https://openrouter.ai/api/v1',
      ...config
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'ABCSteps Learning Platform'
      }
    });
  }

  /**
   * Classify the task type based on the input message
   */
  classifyTask(message: string): TaskType {
    const lowerMessage = message.toLowerCase();
    
    // Simple tasks: greetings, basic questions, short queries
    const simplePatterns = [
      /^(hi|hello|hey|greetings)/,
      /^(what|who|when|where) is/,
      /^(tell me|explain) (a|the) (definition|meaning)/,
      /^(thank|thanks|bye|goodbye)/,
      /^(yes|no|ok|okay|sure)/
    ];

    // Complex tasks: analysis, summarization, long-form content
    const complexPatterns = [
      /(analyz|summar|synthesi|evaluat|compar)/,
      /(deep dive|comprehensive|detailed analysis)/,
      /(research|investigate|explore in depth)/,
      /(create|generate|write) (a|an) (essay|report|analysis)/,
      /(solve|calculate|derive|prove)/
    ];

    // Check for simple patterns
    if (simplePatterns.some(pattern => pattern.test(lowerMessage))) {
      return TaskType.SIMPLE;
    }

    // Check for complex patterns
    if (complexPatterns.some(pattern => pattern.test(lowerMessage))) {
      return TaskType.COMPLEX;
    }

    // Check message length as a factor
    const wordCount = message.split(/\s+/).length;
    if (wordCount < 10) {
      return TaskType.SIMPLE;
    } else if (wordCount > 50) {
      return TaskType.COMPLEX;
    }

    // Default to balanced for Socratic dialogue and moderate tasks
    return TaskType.BALANCED;
  }

  /**
   * 🌀 Map task type to divine consciousness tier
   * Aligns query vibration with appropriate divine form
   */
  getModelTier(taskType: TaskType): ModelTier {
    switch (taskType) {
      case TaskType.SIMPLE:
        return ModelTier.BRAHMA;
      case TaskType.BALANCED:
        return ModelTier.VISHNU;
      case TaskType.COMPLEX:
        return ModelTier.SHIVA;
      default:
        return ModelTier.VISHNU;
    }
  }

  /**
   * ✨ Select divine manifestation from consciousness tier
   * Chooses the specific avatar for the task
   */
  selectModel(tier: ModelTier, preferredIndex: number = 0): string {
    const models = TRIMURTI_MODELS[tier].models;
    const index = Math.min(preferredIndex, models.length - 1);
    return models[index];
  }

  /**
   * 🔱 Divine Router - Channels queries to appropriate consciousness
   * Performs the sacred routing based on karmic classification
   */
  async route(message: string, options?: {
    preferredModelIndex?: number;
    forceTaskType?: TaskType;
    systemPrompt?: string;
  }) {
    // Classify the task
    const taskType = options?.forceTaskType || this.classifyTask(message);
    
    // Get appropriate model tier
    const tier = this.getModelTier(taskType);
    
    // Select specific model
    const model = this.selectModel(tier, options?.preferredModelIndex || 0);

    // Create the completion
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        ...(options?.systemPrompt ? [{
          role: 'system' as const,
          content: options.systemPrompt
        }] : []),
        {
          role: 'user' as const,
          content: message
        }
      ],
      temperature: this.getTemperatureForTier(tier),
      max_tokens: this.getMaxTokensForTier(tier)
    });

    return {
      response: response.choices[0]?.message?.content || '',
      model,
      tier,
      taskType,
      usage: response.usage
    };
  }

  /**
   * Get temperature setting based on tier
   */
  private getTemperatureForTier(tier: ModelTier): number {
    switch (tier) {
      case ModelTier.BRAHMA:
        return 0.3;  // More deterministic for simple tasks
      case ModelTier.VISHNU:
        return 0.7;  // Balanced creativity
      case ModelTier.SHIVA:
        return 0.8;  // Higher creativity for complex analysis
      default:
        return 0.7;
    }
  }

  /**
   * Get max tokens based on tier
   */
  private getMaxTokensForTier(tier: ModelTier): number {
    switch (tier) {
      case ModelTier.BRAHMA:
        return 1000;   // Shorter responses for simple tasks
      case ModelTier.VISHNU:
        return 2000;   // Medium length for dialogue
      case ModelTier.SHIVA:
        return 4000;   // Longer for deep analysis
      default:
        return 2000;
    }
  }

  /**
   * Stream response with task-based routing
   */
  async stream(message: string, options?: {
    preferredModelIndex?: number;
    forceTaskType?: TaskType;
    systemPrompt?: string;
  }) {
    // Classify the task
    const taskType = options?.forceTaskType || this.classifyTask(message);
    
    // Get appropriate model tier
    const tier = this.getModelTier(taskType);
    
    // Select specific model
    const model = this.selectModel(tier, options?.preferredModelIndex || 0);

    // Create the streaming completion
    const stream = await this.client.chat.completions.create({
      model,
      messages: [
        ...(options?.systemPrompt ? [{
          role: 'system' as const,
          content: options.systemPrompt
        }] : []),
        {
          role: 'user' as const,
          content: message
        }
      ],
      temperature: this.getTemperatureForTier(tier),
      max_tokens: this.getMaxTokensForTier(tier),
      stream: true
    });

    return {
      stream,
      model,
      tier,
      taskType
    };
  }
}

// Factory function for creating router instance
export function createTrimurtiRouter(apiKey?: string): TrimurtiRouter {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  
  if (!key) {
    throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable.');
  }

  return new TrimurtiRouter({ apiKey: key });
}
# Trimurti Router - Intelligent Model Routing

The Trimurti Router implements an intelligent model routing strategy based on the Hindu Trinity concept, automatically selecting the most appropriate AI model based on task complexity.

## Overview

The system classifies tasks into three tiers:
- **Brahma (Creator)** - Fast models for simple queries and greetings
- **Vishnu (Preserver)** - Balanced models for Socratic dialogue and moderate complexity
- **Shiva (Transformer)** - Powerful models for deep analysis and summarization

## Setup

1. Add your OpenRouter API key to `.env`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

2. The system is already integrated into the AI providers system and ready to use.

## Usage

### Basic Usage

```typescript
import { getTrimurtiRouter } from '@/ai/openrouter-provider';

const router = getTrimurtiRouter();
const result = await router.route("What is photosynthesis?");

console.log(result.response);    // AI response
console.log(result.taskType);    // 'simple', 'balanced', or 'complex'
console.log(result.tier);        // 'brahma', 'vishnu', or 'shiva'
console.log(result.model);       // Actual model used
```

### Using with React Hook

```typescript
import { useTrimurti } from '@/hooks/use-trimurti';

function MyComponent() {
  const { sendMessage, lastTaskType, lastModel, isLoading } = useTrimurti();
  
  const handleSubmit = async (message: string) => {
    const response = await sendMessage(message, {
      onStream: (chunk) => console.log(chunk)
    });
  };
}
```

### Using with Vercel AI SDK

```typescript
import { streamText } from 'ai';
import { vivek } from '@/ai/providers';

// Use auto-routing model
const result = await streamText({
  model: vivek('trimurti-auto'),
  messages: [{ role: 'user', content: 'Explain quantum computing' }]
});

// Or use specific tier models
const result = await streamText({
  model: vivek('trimurti-vishnu-haiku'),
  messages: [{ role: 'user', content: 'Help me learn algebra' }]
});
```

## Task Classification Examples

### Brahma Tier (Simple)
- Greetings: "Hi, how are you?"
- Basic questions: "What is the capital of France?"
- Simple acknowledgments: "Thank you!"
- Short queries: "Define photosynthesis"

### Vishnu Tier (Balanced)
- Socratic dialogue: "Can you help me understand calculus using the Socratic method?"
- Educational guidance: "Guide me through solving this algebra problem"
- Moderate analysis: "Compare renewable and non-renewable energy"
- Interactive learning: "Let's explore the concept of democracy together"

### Shiva Tier (Complex)
- Deep analysis: "Analyze the economic impacts of climate change"
- Summarization: "Summarize this research paper on quantum computing"
- Complex comparisons: "Compare and contrast Kant and Hume's philosophies"
- Comprehensive tasks: "Create a detailed business plan for a startup"

## Available Models

### Free Models (Brahma Tier)
- `trimurti-brahma-gemini-flash` - Google Gemini 2.0 Flash
- `trimurti-brahma-llama` - Meta Llama 3.2 3B
- `trimurti-brahma-qwen` - Qwen 2.5 7B

### Pro Models (Vishnu Tier)
- `trimurti-vishnu-haiku` - Claude 3.5 Haiku
- `trimurti-vishnu-gpt-mini` - GPT-4o Mini
- `trimurti-vishnu-gemini` - Gemini 1.5 Flash

### Pro Models (Shiva Tier)
- `trimurti-shiva-sonnet` - Claude 3.5 Sonnet
- `trimurti-shiva-gpt4o` - GPT-4o
- `trimurti-shiva-gemini-pro` - Gemini 1.5 Pro

### Special Model
- `trimurti-auto` - Automatically selects the best model based on task analysis

## Advanced Options

### Force Task Type
```typescript
const result = await router.route(message, {
  forceTaskType: TaskType.COMPLEX,
  systemPrompt: 'Provide detailed analysis'
});
```

### Custom Model Selection
```typescript
const result = await router.route(message, {
  preferredModelIndex: 1  // Use second model in tier
});
```

### Streaming Responses
```typescript
const { stream, model, tier } = await router.stream(message);

for await (const chunk of stream) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

## Configuration

The router automatically configures:
- **Temperature**: Lower for simple tasks (0.3), higher for complex tasks (0.8)
- **Max Tokens**: 1000 for Brahma, 2000 for Vishnu, 4000 for Shiva
- **Model Selection**: Automatic based on task classification

## Benefits

1. **Cost Optimization**: Uses cheaper/free models for simple tasks
2. **Performance**: Fast responses for basic queries
3. **Quality**: Powerful models for complex analysis
4. **Automatic**: No manual model selection needed
5. **Flexible**: Can override automatic selection when needed
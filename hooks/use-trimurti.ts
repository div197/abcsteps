import { useState, useCallback } from 'react';
import { getTrimurtiRouter, routeToTrimurtiModel } from '@/ai/openrouter-provider';
import { TaskType, ModelTier } from '@/lib/trimurti-router';
import { streamText } from 'ai';
import { vivek } from '@/ai/providers';

interface TrimurtiState {
  isLoading: boolean;
  error: string | null;
  lastTaskType: TaskType | null;
  lastModelTier: ModelTier | null;
  lastModel: string | null;
}

export function useTrimurti() {
  const [state, setState] = useState<TrimurtiState>({
    isLoading: false,
    error: null,
    lastTaskType: null,
    lastModelTier: null,
    lastModel: null,
  });

  const sendMessage = useCallback(async (
    message: string,
    options?: {
      forceTaskType?: TaskType;
      systemPrompt?: string;
      onStream?: (text: string) => void;
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const router = getTrimurtiRouter();
      
      // Classify the task
      const taskType = options?.forceTaskType || router.classifyTask(message);
      const tier = router.getModelTier(taskType);
      const model = router.selectModel(tier);

      setState(prev => ({
        ...prev,
        lastTaskType: taskType,
        lastModelTier: tier,
        lastModel: model,
      }));

      if (options?.onStream) {
        // Use streaming
        const { stream } = await router.stream(message, {
          forceTaskType: options.forceTaskType,
          systemPrompt: options.systemPrompt,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            fullResponse += content;
            options.onStream(content);
          }
        }

        setState(prev => ({ ...prev, isLoading: false }));
        return fullResponse;
      } else {
        // Use standard response
        const result = await router.route(message, {
          forceTaskType: options.forceTaskType,
          systemPrompt: options.systemPrompt,
        });

        setState(prev => ({ ...prev, isLoading: false }));
        return result.response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const sendWithVercelAI = useCallback(async (
    message: string,
    options?: {
      systemPrompt?: string;
      forceTaskType?: TaskType;
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { modelValue, taskType, tier } = await routeToTrimurtiModel(message, {
        forceTaskType: options?.forceTaskType,
      });

      setState(prev => ({
        ...prev,
        lastTaskType: taskType,
        lastModelTier: tier,
        lastModel: modelValue,
      }));

      const result = await streamText({
        model: vivek(modelValue),
        messages: [
          ...(options?.systemPrompt ? [{
            role: 'system' as const,
            content: options.systemPrompt,
          }] : []),
          {
            role: 'user' as const,
            content: message,
          },
        ],
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const classifyMessage = useCallback((message: string): TaskType => {
    const router = getTrimurtiRouter();
    return router.classifyTask(message);
  }, []);

  return {
    ...state,
    sendMessage,
    sendWithVercelAI,
    classifyMessage,
  };
}
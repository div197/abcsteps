// /app/api/chat/route.ts
import {
  generateTitleFromUserMessage,
  getGroupConfig,
  getUserMessageCount,
  getCurrentUser,
  getCustomInstructions
} from '@/app/actions';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import {
  convertToCoreMessages,
  streamText,
  NoSuchToolError,
  appendResponseMessages,
  CoreToolMessage,
  CoreAssistantMessage,
  createDataStream,
  generateObject,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { 
  getMaxOutputTokens, 
  requiresAuthentication, 
  requiresProSubscription, 
  shouldBypassRateLimits,
  selectOptimalModel,
  classifyEducationalTask,
  getModelConfig as getTuryamModelConfig
} from '@/ai/providers';
import {
  createStreamId,
  getChatById,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
  incrementMessageUsage,
  updateChatTitleById,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';
import { createResumableStreamContext, type ResumableStreamContext } from 'resumable-stream';
import { after } from 'next/server';
import { differenceInSeconds } from 'date-fns';
import { Chat, CustomInstructions } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { geolocation } from '@vercel/functions';
import { recordRequest } from '../../../monitoring';

// Import all tools from the organized tool files
import {
  textTranslateTool,
  weatherTool,
  codeInterpreterTool,
  findPlaceOnMapTool,
  datetimeTool,
  greetingTool,
  mcpSearchTool,
  memoryManagerTool,
} from '@/lib/tools';

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

function getTrailingMessageId({ messages }: { messages: Array<ResponseMessage> }): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(' > Resumable streams are disabled due to missing REDIS_URL');
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

// 🔱 TURYAM State - Direct OpenRouter Client
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'ABCSteps Vivek - TURYAM Consciousness'
  }
});

export async function POST(req: Request) {
  console.log('🔍 Search API endpoint hit');
  
  const requestStartTime = Date.now();
  const { messages, model, group, timezone, id, selectedVisibilityType } = await req.json();
  const { latitude, longitude } = geolocation(req);

  console.log('--------------------------------');
  console.log('Location: ', latitude, longitude);
  console.log('--------------------------------');

  console.log('--------------------------------');
  console.log('Messages: ', messages);
  console.log('--------------------------------');

  const userCheckTime = Date.now();
  const user = await getCurrentUser();
  const streamId = 'stream-' + uuidv4();
  console.log(`⏱️  User check took: ${((Date.now() - userCheckTime) / 1000).toFixed(2)}s`);

  if (!user) {
    console.log('User not found');
  }
  let customInstructions: CustomInstructions | null = null;

  // Check if model requires authentication (fast check)
  const authRequiredModels = ['vivek-anthropic', 'vivek-google'];
  if (authRequiredModels.includes(model) && !user) {
    return new ChatSDKError('unauthorized:model', `Authentication required to access ${model}`).toResponse();
  }

  // For authenticated users, do critical checks in parallel
  let criticalChecksPromise: Promise<{
    canProceed: boolean;
    error?: any;
    isProUser?: boolean;
  }> = Promise.resolve({ canProceed: true });

  if (user) {
    customInstructions = await getCustomInstructions(user);
    criticalChecksPromise = (async () => {
      try {
        const criticalChecksStartTime = Date.now();

        const isProUser = user.isProUser;

        // Check if model requires authentication
        if (requiresAuthentication(model) && !user) {
          return { canProceed: false, error: new ChatSDKError('unauthorized:model', `${model} requires authentication`) };
        }

        // Check if model requires Pro subscription
        if (requiresProSubscription(model) && !isProUser) {
          return { canProceed: false, error: new ChatSDKError('upgrade_required:model', `${model} requires a Pro subscription`) };
        }

        // Pro users skip all usage limit checks
        if (isProUser) {
          console.log(`⏱️  Critical checks took: ${((Date.now() - criticalChecksStartTime) / 1000).toFixed(2)}s (Pro user - skipped usage checks)`);
          return {
            canProceed: true,
            messageCount: 0, // Not relevant for pro users
            isProUser: true,
            subscriptionData: user.subscriptionData,
            shouldBypassLimits: true
          };
        }

        // Only check usage limits for non-pro users
        const messageCountResult = await getUserMessageCount(user); // Pass user to avoid duplicate session lookup
        console.log(`⏱️  Critical checks took: ${((Date.now() - criticalChecksStartTime) / 1000).toFixed(2)}s`);

        if (messageCountResult.error) {
          console.error('Error getting message count:', messageCountResult.error);
          return { canProceed: false, error: new ChatSDKError('bad_request:api', 'Failed to verify usage limits') };
        }

        // Check if user should bypass limits for free unlimited models
        const shouldBypassLimits = shouldBypassRateLimits(model, user);

        if (!shouldBypassLimits && messageCountResult.count !== undefined) {
          const dailyLimit = 100; // Non-pro users have a daily limit
          if (messageCountResult.count >= dailyLimit) {
            return { canProceed: false, error: new ChatSDKError('rate_limit:chat', 'Daily search limit reached') };
          }
        }

        return {
          canProceed: true,
          messageCount: messageCountResult.count,
          isProUser: false,
          subscriptionData: user.subscriptionData,
          shouldBypassLimits
        };
      } catch (error) {
        console.error('Critical checks failed:', error);
        return { canProceed: false, error: new ChatSDKError('bad_request:api', 'Failed to verify user access') };
      }
    })();
  } else {
    // For anonymous users, check if model requires authentication
    if (requiresAuthentication(model)) {
      throw new ChatSDKError('unauthorized:model', `${model} requires authentication`);
    }

    criticalChecksPromise = Promise.resolve({
      canProceed: true,
      messageCount: 0,
      isProUser: false,
      subscriptionData: null,
      shouldBypassLimits: false
    });
  }

  // Get configuration in parallel with critical checks
  const configStartTime = Date.now();
  const configPromise = getGroupConfig(group).then(config => {
    console.log(`⏱️  Config loading took: ${((Date.now() - configStartTime) / 1000).toFixed(2)}s`);
    return config;
  });

  // Start streaming immediately while background operations continue
  const stream = createDataStream({
    execute: async (dataStream) => {
      // Wait for critical checks to complete
      const criticalWaitStartTime = Date.now();
      const criticalResult = await criticalChecksPromise;
      console.log(`⏱️  Critical checks wait took: ${((Date.now() - criticalWaitStartTime) / 1000).toFixed(2)}s`);

      if (!criticalResult.canProceed) {
        throw criticalResult.error;
      }

      // Get configuration
      const configWaitStartTime = Date.now();
      const { tools: activeTools, instructions } = await configPromise;
      console.log(`⏱️  Config wait took: ${((Date.now() - configWaitStartTime) / 1000).toFixed(2)}s`);

      // Critical: Ensure chat exists before streaming starts
      if (user) {
        const chatCheckStartTime = Date.now();
        const chat = await getChatById({ id });
        console.log(`⏱️  Chat check took: ${((Date.now() - chatCheckStartTime) / 1000).toFixed(2)}s`);

        if (!chat) {
          // Create chat without title first - title will be generated in onFinish
          const chatCreateStartTime = Date.now();
          await saveChat({
            id,
            userId: user.id,
            title: 'New conversation', // Temporary title that will be updated in onFinish
            visibility: selectedVisibilityType,
          });
          console.log(`⏱️  Chat creation took: ${((Date.now() - chatCreateStartTime) / 1000).toFixed(2)}s`);
        } else {
          if (chat.userId !== user.id) {
            throw new ChatSDKError('forbidden:chat', 'This chat belongs to another user');
          }
        }

        // Save user message and create stream ID in background (non-blocking)
        const backgroundOperations = (async () => {
          try {
            const backgroundStartTime = Date.now();
            await Promise.all([
              saveMessages({
                messages: [
                  {
                    chatId: id,
                    id: messages[messages.length - 1].id,
                    role: 'user',
                    parts: messages[messages.length - 1].parts,
                    attachments: messages[messages.length - 1].experimental_attachments ?? [],
                    createdAt: new Date(),
                  },
                ],
              }),
              createStreamId({ streamId, chatId: id }),
            ]);
            console.log(`⏱️  Background operations took: ${((Date.now() - backgroundStartTime) / 1000).toFixed(2)}s`);

            console.log('--------------------------------');
            console.log('Messages saved: ', messages);
            console.log('--------------------------------');
          } catch (error) {
            console.error('Error in background message operations:', error);
            // These are non-critical errors that shouldn't stop the stream
          }
        })();

        // Start background operations but don't wait for them
        backgroundOperations.catch((error) => {
          console.error('Background operations failed:', error);
        });
      }

      console.log('--------------------------------');
      console.log('Messages: ', messages);
      console.log('--------------------------------');
      console.log('Running with model: ', model.trim());
      console.log('Group: ', group);
      console.log('Timezone: ', timezone);

      // 🕉️ TURYAM State - Unified Educational Model Selection
      let selectedModel = model;
      
      // Intelligent model selection based on educational context
      if (group === 'guru' || model === 'vivek-default' || !model || model.startsWith('turyam-')) {
        try {
          console.log('🕉️ Activating TURYAM state for educational guidance...');
          const lastUserMessage = messages[messages.length - 1]?.content || '';
          const taskComplexity = classifyEducationalTask(lastUserMessage);
          const isProUser = criticalResult.user?.isProUser || false;
          
          selectedModel = selectOptimalModel(criticalResult.user, isProUser, taskComplexity);
          
          console.log(`🌟 TURYAM selected: ${selectedModel} (complexity: ${taskComplexity})`);
          console.log(`👤 User tier: ${isProUser ? 'Pro' : 'Standard'}`);
        } catch (error) {
          console.warn('⚠️ TURYAM routing failed, using primary model:', error);
          selectedModel = 'turyam-primary'; // Safe fallback
        }
      } else if (selectedModel === 'vivek-default') {
        // Always redirect default to TURYAM primary
        selectedModel = 'turyam-primary';
      }

      // Calculate time to reach streamText
      const preStreamTime = Date.now();
      const setupTime = (preStreamTime - requestStartTime) / 1000;
      console.log('--------------------------------');
      console.log(`Time to reach streamText: ${setupTime.toFixed(2)} seconds`);
      console.log(`Final model selection: ${selectedModel} (TURYAM State)`);
      console.log('--------------------------------');

      // 🔱 Get TURYAM model configuration for the selected model
      const modelConfig = getTuryamModelConfig(selectedModel);
      const actualModel = modelConfig?.model || 'google/gemini-2.5-flash-lite-preview-06-17';
      
      const result = streamText({
        model: openrouter(actualModel),
        messages: convertToCoreMessages(messages),
        maxTokens: getMaxOutputTokens(selectedModel),
        temperature: selectedModel === 'turyam-pro' ? 0.7 : selectedModel === 'turyam-primary' ? 0.6 : 0.65,
        maxSteps: 5,
        maxRetries: 10,
        experimental_activeTools: [...activeTools],
        system: instructions + (customInstructions ? `\n\nThe user's custom instructions are as follows and YOU MUST FOLLOW THEM AT ALL COSTS: ${customInstructions?.content}` : '\n') + (latitude && longitude ? `\n\nThe user's location is ${latitude}, ${longitude}.` : ''),
        toolChoice: 'auto',
        providerOptions: {
          openai: {
            // TURYAM State optimized configuration
            parallelToolCalls: selectedModel === 'turyam-pro',
            strictSchemas: false,
            seed: group === 'guru' ? 108 : undefined, // Sacred consistency for Guru mode
          } as OpenAIResponsesProviderOptions,
        },
        tools: {
          // Location & Maps
          find_place_on_map: findPlaceOnMapTool,
          get_weather_data: weatherTool,

          // Utility Tools
          text_translate: textTranslateTool,
          code_interpreter: codeInterpreterTool,
          datetime: datetimeTool,
          mcp_search: mcpSearchTool,
          memory_manager: memoryManagerTool,
          greeting: greetingTool,
        },
        experimental_repairToolCall: async ({ toolCall, tools, parameterSchema, error }) => {
          if (NoSuchToolError.isInstance(error)) {
            return null; // do not attempt to fix invalid tool names
          }

          console.log('Fixing tool call================================');
          console.log('toolCall', toolCall);
          console.log('tools', tools);
          console.log('parameterSchema', parameterSchema);
          console.log('error', error);

          const tool = tools[toolCall.toolName as keyof typeof tools];

          const { object: repairedArgs } = await generateObject({
            model: openrouter('openai/gpt-4o-mini'),
            schema: tool.parameters,
            prompt: [
              `The model tried to call the tool "${toolCall.toolName}"` + ` with the following arguments:`,
              JSON.stringify(toolCall.args),
              `The tool accepts the following schema:`,
              JSON.stringify(parameterSchema(toolCall)),
              'Please fix the arguments.',
              'Do not use print statements stock chart tool.',
              `For the stock chart tool you have to generate a python code with matplotlib and yfinance to plot the stock chart.`,
              `For the web search make multiple queries to get the best results.`,
              `Today's date is ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`,
            ].join('\n'),
          });

          console.log('repairedArgs', repairedArgs);

          return { ...toolCall, args: JSON.stringify(repairedArgs) };
        },
        onChunk(event) {
          if (event.chunk.type === 'tool-call') {
            console.log('Called Tool: ', event.chunk.toolName);
          }
        },
        onStepFinish(event) {
          if (event.warnings) {
            console.log('Warnings: ', event.warnings);
          }
        },
        onFinish: async (event) => {
          console.log('Fin reason: ', event.finishReason);
          console.log('Reasoning: ', event.reasoning);
          console.log('reasoning details: ', event.reasoningDetails);
          console.log('Steps: ', event.steps);
          console.log('Messages: ', event.response.messages);
          console.log('Response Body: ', event.response.body);
          console.log('Provider metadata: ', event.providerMetadata);
          console.log('Sources: ', event.sources);
          console.log('Usage: ', event.usage);

          // Step 49-52: Record monitoring metrics
          const processingTime = Date.now() - requestStartTime;
          try {
            recordRequest(processingTime, event.finishReason === 'stop', null);
          } catch (monitoringError) {
            console.warn('Monitoring recording failed:', monitoringError);
          }

          // Only proceed if user is authenticated
          if (user?.id && event.finishReason === 'stop') {
            // FIRST: Generate and update title for new conversations (highest priority)
            try {
              const chat = await getChatById({ id });
              if (chat && chat.title === 'New conversation') {
                console.log('Generating title for new conversation...');
                const title = await generateTitleFromUserMessage({
                  message: messages[messages.length - 1],
                });

                console.log('--------------------------------');
                console.log('Generated title: ', title);
                console.log('--------------------------------');

                // Update the chat with the generated title
                await updateChatTitleById({ chatId: id, title });
              }
            } catch (titleError) {
              console.error('Failed to generate or update title:', titleError);
              // Title generation failure shouldn't break the conversation
            }

            // Track message usage for rate limiting (deletion-proof)
            // Only track usage for models that are not free unlimited
            try {
              if (!shouldBypassRateLimits(model, user)) {
                await incrementMessageUsage({ userId: user.id });
              }
            } catch (error) {
              console.error('Failed to track message usage:', error);
            }


            // LAST: Save assistant message (after title is generated)
            try {
              const assistantId = getTrailingMessageId({
                messages: event.response.messages.filter((message: any) => message.role === 'assistant'),
              });

              if (!assistantId) {
                throw new Error('No assistant message found!');
              }

              const [, assistantMessage] = appendResponseMessages({
                messages: [messages[messages.length - 1]],
                responseMessages: event.response.messages,
              });

              await saveMessages({
                messages: [
                  {
                    id: assistantId,
                    chatId: id,
                    role: assistantMessage.role,
                    parts: assistantMessage.parts,
                    attachments: assistantMessage.experimental_attachments ?? [],
                    createdAt: new Date(),
                  },
                ],
              });
            } catch (error) {
              console.error('Failed to save assistant message:', error);
            }
          }

          // Calculate and log overall request processing time
          const requestEndTime = Date.now();
          const totalProcessingTime = (requestEndTime - requestStartTime) / 1000;
          console.log('--------------------------------');
          console.log(`Total request processing time: ${totalProcessingTime.toFixed(2)} seconds`);
          console.log('--------------------------------');
        },
        onError(event) {
          console.log('Error: ', event.error);
          
          // Step 53-56: Record error metrics
          const processingTime = Date.now() - requestStartTime;
          try {
            recordRequest(processingTime, false, event.error);
          } catch (monitoringError) {
            console.warn('Error monitoring recording failed:', monitoringError);
          }
          
          // Calculate and log processing time even on error
          const processingTimeSeconds = processingTime / 1000;
          console.log('--------------------------------');
          console.log(`Request processing time (with error): ${processingTimeSeconds.toFixed(2)} seconds`);
          console.log('--------------------------------');
        },
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError(error) {
      console.log('Error: ', error);
      if (error instanceof Error && error.message.includes('Rate Limit')) {
        return 'Oops, you have reached the rate limit! Please try again later.';
      }
      return 'Oops, an error occurred!';
    },
  });
  const streamContext = getStreamContext();

  if (streamContext) {
    return new Response(await streamContext.resumableStream(streamId, () => stream));
  } else {
    return new Response(stream);
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new ChatSDKError('bad_request:api', 'Chat ID is required').toResponse();
  }

  const session = await auth.api.getSession(request);

  if (!session?.user) {
    return new ChatSDKError('unauthorized:auth', 'Authentication required to resume chat stream').toResponse();
  }

  let chat: Chat | null;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat', 'Access denied to private chat').toResponse();
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const emptyDataStream = createDataStream({
    execute: () => { },
  });

  const stream = await streamContext.resumableStream(recentStreamId, () => emptyDataStream);

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== 'assistant') {
      return new Response(emptyDataStream, { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createDataStream({
      execute: (buffer) => {
        buffer.writeData({
          type: 'append-message',
          message: JSON.stringify(mostRecentMessage),
        });
      },
    });

    return new Response(restoredStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}

import { tool } from 'ai';
import { z } from 'zod';
import MemoryClient from 'mem0ai';
import { serverEnv } from '@/env/server';
import { getCurrentUser } from '@/app/actions';
import { enhancedMemoryManagerTool, type MemoryType, type MemoryMetadata } from './memory-manager-enhanced';

// Legacy simple memory manager - now enhanced with Smriti protocol support
export const memoryManagerTool = tool({
  description: 'Manage personal memories with add and search operations. Now enhanced with sacred memory schema (Smriti protocol) support.',
  parameters: z.object({
    action: z.enum(['add', 'search']).describe('The memory operation to perform'),
    content: z.string().describe('The memory content for add operation'),
    query: z.string().describe('The search query for search operations'),
    // Optional enhanced parameters
    memory_type: z.enum(['declarative', 'episodic', 'procedural']).optional()
      .describe('Type of memory: declarative (Gyan/facts), episodic (Bhava/experiences), procedural (Kriya/skills)'),
    topic: z.string().optional().describe('Main topic or subject area'),
    sub_topic: z.string().optional().describe('Specific sub-topic'),
    tags: z.array(z.string()).optional().describe('Additional tags for categorization'),
    importance: z.number().min(1).max(10).optional().describe('Importance level 1-10'),
  }),
  execute: async ({
    action,
    content,
    query,
    memory_type,
    topic,
    sub_topic,
    tags,
    importance,
  }: {
    action: 'add' | 'search';
    content?: string;
    query?: string;
    memory_type?: MemoryType;
    topic?: string;
    sub_topic?: string;
    tags?: string[];
    importance?: number;
  }) => {
    const client = new MemoryClient({ apiKey: serverEnv.MEM0_API_KEY });
    const user = await getCurrentUser();
    let userId = user?.id;
    console.log('action', action);
    console.log('content', content);
    console.log('query', query);

    try {
      switch (action) {
        case 'add': {
          if (!content) {
            return {
              success: false,
              action: 'add',
              message: 'Content is required for add operation',
            };
          }
          
          // Use enhanced tool if metadata is provided
          if (memory_type || topic || sub_topic || tags || importance) {
            return enhancedMemoryManagerTool.execute({
              action: 'add',
              content,
              metadata: {
                type: memory_type || 'declarative',
                topic: topic || 'general',
                sub_topic,
                tags,
                importance: importance || 5,
                language: 'english',
              },
            });
          }
          
          // Fallback to simple add for backward compatibility
          const result = await client.add(
            [
              {
                role: 'user',
                content: content,
              },
            ],
            {
              user_id: userId,
              org_id: serverEnv.MEM0_ORG_ID,
              project_id: serverEnv.MEM0_PROJECT_ID,
            },
          );
          if (result.length === 0) {
            return {
              success: false,
              action: 'add',
              message: 'No memory added',
            };
          }
          console.log('add result', result);
          const { id, data, event } = result[0];
          return {
            success: true,
            action: 'add',
            memory: { id, data, event, user_id: userId },
          };
        }
        case 'search': {
          if (!query) {
            return {
              success: false,
              action: 'search',
              message: 'Query is required for search operation',
            };
          }
          
          // Use enhanced search if filters are provided
          if (memory_type || topic || sub_topic || tags) {
            return enhancedMemoryManagerTool.execute({
              action: 'search',
              search_params: {
                queries: [query],
                filters: {
                  type: memory_type,
                  topic,
                  sub_topic,
                  tags,
                },
                limit: 20,
              },
            });
          }
          
          // Fallback to simple search for backward compatibility
          const searchFilters = {
            AND: [{ user_id: userId }],
          };
          const result = await client.search(query, {
            filters: searchFilters,
            api_version: 'v2',
          });
          if (!result || !result[0]) {
            return {
              success: false,
              action: 'search',
              message: 'No results found for the search query',
            };
          }
          console.log('search result', result);
          return {
            success: true,
            action: 'search',
            results: result[0],
          };
        }
      }
    } catch (error) {
      console.error('Memory operation error:', error);
      throw error;
    }
  },
});

// Re-export the enhanced tool for direct access
export { enhancedMemoryManagerTool } from './memory-manager-enhanced'; 
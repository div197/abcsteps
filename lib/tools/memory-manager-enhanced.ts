import { tool } from 'ai';
import { z } from 'zod';
import MemoryClient from 'mem0ai';
import { serverEnv } from '@/env/server';
import { getCurrentUser } from '@/app/actions';

// 🕉️ Define the sacred memory schema (Smriti protocol) 🕉️
const MemoryTypeEnum = z.enum(['declarative', 'episodic', 'procedural']);
const LanguageEnum = z.enum(['english', 'hindi', 'sanskrit', 'mixed']);

// 🌼 Sacred Metadata Structure - The Divine Record Schema 🌼
const MemoryMetadataSchema = z.object({
  type: MemoryTypeEnum.describe('Memory layer type: declarative (Gyan), episodic (Bhava), or procedural (Kriya)'),
  topic: z.string().describe('Main topic or subject area'),
  sub_topic: z.string().optional().describe('Specific sub-topic or concept'),
  concept: z.string().optional().describe('Core concept or principle'),
  language: LanguageEnum.default('english').describe('Language of the memory content'),
  tags: z.array(z.string()).optional().describe('Additional tags for categorization'),
  importance: z.number().min(1).max(10).default(5).describe('Importance level from 1-10'),
  context: z.string().optional().describe('Contextual information or associations'),
  learning_progress: z.object({
    understanding_level: z.number().min(0).max(100).optional(),
    practice_count: z.number().optional(),
    last_reviewed: z.string().optional(),
  }).optional().describe('Student learning progress tracking'),
});

// 🔍 Holistic Chitta Scan Parameters - Multi-dimensional Search 🔍
const SearchParametersSchema = z.object({
  queries: z.array(z.string()).min(1).describe('Multiple search queries for holistic retrieval'),
  filters: z.object({
    type: MemoryTypeEnum.optional(),
    topic: z.string().optional(),
    sub_topic: z.string().optional(),
    language: LanguageEnum.optional(),
    tags: z.array(z.string()).optional(),
    importance_min: z.number().min(1).max(10).optional(),
    date_range: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }).optional().describe('Filters for memory search'),
  limit: z.number().min(1).max(100).default(20),
});

export const enhancedMemoryManagerTool = tool({
  description: 'Enhanced memory management system implementing the sacred memory schema (Smriti protocol) with three layers of memory, structured metadata, and holistic search capabilities.',
  parameters: z.object({
    action: z.enum(['add', 'search', 'update', 'archive', 'get_by_id', 'analyze_progress'])
      .describe('The memory operation to perform'),
    
    // For add operation
    content: z.string().optional().describe('The memory content for add operation'),
    metadata: MemoryMetadataSchema.optional().describe('Structured metadata for the memory'),
    
    // For search operation
    search_params: SearchParametersSchema.optional().describe('Search parameters for holistic retrieval'),
    
    // For update operation
    memory_id: z.string().optional().describe('Memory ID for update/archive operations'),
    updates: z.object({
      content: z.string().optional(),
      metadata: MemoryMetadataSchema.partial().optional(),
    }).optional().describe('Updates to apply to existing memory'),
    
    // For progress analysis
    student_id: z.string().optional().describe('Student ID for progress analysis'),
    topic_filter: z.string().optional().describe('Topic to analyze progress for'),
  }),
  
  execute: async (params) => {
    const client = new MemoryClient({ apiKey: serverEnv.MEM0_API_KEY });
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
      return {
        success: false,
        action: params.action,
        message: 'User authentication required',
      };
    }

    try {
      switch (params.action) {
        case 'add': {
          if (!params.content) {
            return {
              success: false,
              action: 'add',
              message: 'Content is required for add operation',
            };
          }

          // Prepare metadata with Smriti protocol structure
          const metadata = {
            ...params.metadata,
            sacred_schema: 'smriti_v1',
            created_by: 'enhanced_memory_manager',
            timestamp: new Date().toISOString(),
          };

          const result = await client.add(
            [{
              role: 'user',
              content: params.content,
            }],
            {
              user_id: userId,
              org_id: serverEnv.MEM0_ORG_ID,
              project_id: serverEnv.MEM0_PROJECT_ID,
              metadata,
              categories: [
                params.metadata?.type || 'declarative',
                params.metadata?.topic || 'general',
                ...(params.metadata?.tags || []),
              ],
            },
          );

          if (result.length === 0) {
            return {
              success: false,
              action: 'add',
              message: 'No memory added',
            };
          }

          const { id, data, event } = result[0];
          return {
            success: true,
            action: 'add',
            memory: {
              id,
              data,
              event,
              user_id: userId,
              metadata,
            },
            message: `Memory added successfully with ${params.metadata?.type || 'declarative'} type`,
          };
        }

        case 'search': {
          if (!params.search_params?.queries || params.search_params.queries.length === 0) {
            return {
              success: false,
              action: 'search',
              message: 'At least one query is required for search operation',
            };
          }

          // Prepare search filters
          const baseFilters = {
            AND: [
              { user_id: userId },
              ...(params.search_params.filters?.type ? [{ 'metadata.type': params.search_params.filters.type }] : []),
              ...(params.search_params.filters?.topic ? [{ 'metadata.topic': params.search_params.filters.topic }] : []),
              ...(params.search_params.filters?.language ? [{ 'metadata.language': params.search_params.filters.language }] : []),
            ],
          };

          // Perform holistic search with multiple queries
          const allResults = [];
          const resultMap = new Map(); // To avoid duplicates

          for (const query of params.search_params.queries) {
            const result = await client.search(query, {
              filters: baseFilters,
              api_version: 'v2',
              limit: params.search_params.limit,
            });

            if (result && result[0]) {
              for (const memory of result[0]) {
                if (!resultMap.has(memory.id)) {
                  resultMap.set(memory.id, {
                    ...memory,
                    relevance_score: memory.score || 0,
                    matched_query: query,
                  });
                } else {
                  // Update relevance score if this query returned a higher score
                  const existing = resultMap.get(memory.id);
                  if ((memory.score || 0) > existing.relevance_score) {
                    existing.relevance_score = memory.score || 0;
                    existing.matched_query = query;
                  }
                }
              }
            }
          }

          // Convert map to array and sort by relevance
          const sortedResults = Array.from(resultMap.values())
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .slice(0, params.search_params.limit);

          // Categorize results by memory type
          const categorizedResults = {
            declarative: sortedResults.filter(m => m.metadata?.type === 'declarative'),
            episodic: sortedResults.filter(m => m.metadata?.type === 'episodic'),
            procedural: sortedResults.filter(m => m.metadata?.type === 'procedural'),
            uncategorized: sortedResults.filter(m => !m.metadata?.type),
          };

          return {
            success: true,
            action: 'search',
            results: {
              total: sortedResults.length,
              memories: sortedResults,
              categorized: categorizedResults,
              search_metadata: {
                queries_used: params.search_params.queries,
                filters_applied: params.search_params.filters,
              },
            },
          };
        }

        case 'update': {
          if (!params.memory_id) {
            return {
              success: false,
              action: 'update',
              message: 'Memory ID is required for update operation',
            };
          }

          if (!params.updates || (!params.updates.content && !params.updates.metadata)) {
            return {
              success: false,
              action: 'update',
              message: 'Updates (content or metadata) are required',
            };
          }

          // Get existing memory first
          const existingMemory = await client.get(params.memory_id);
          
          if (!existingMemory) {
            return {
              success: false,
              action: 'update',
              message: 'Memory not found',
            };
          }

          // Merge metadata
          const updatedMetadata = {
            ...existingMemory.metadata,
            ...params.updates.metadata,
            last_updated: new Date().toISOString(),
            update_count: (existingMemory.metadata?.update_count || 0) + 1,
          };

          // Update the memory
          const result = await client.update(params.memory_id, {
            data: params.updates.content || existingMemory.memory,
            metadata: updatedMetadata,
          });

          return {
            success: true,
            action: 'update',
            memory: {
              id: params.memory_id,
              ...result,
              metadata: updatedMetadata,
            },
            message: 'Memory updated successfully',
          };
        }

        case 'archive': {
          if (!params.memory_id) {
            return {
              success: false,
              action: 'archive',
              message: 'Memory ID is required for archive operation',
            };
          }

          // Get existing memory
          const existingMemory = await client.get(params.memory_id);
          
          if (!existingMemory) {
            return {
              success: false,
              action: 'archive',
              message: 'Memory not found',
            };
          }

          // Update metadata to mark as archived
          const archivedMetadata = {
            ...existingMemory.metadata,
            archived: true,
            archived_at: new Date().toISOString(),
            archived_by: userId,
          };

          const result = await client.update(params.memory_id, {
            metadata: archivedMetadata,
          });

          return {
            success: true,
            action: 'archive',
            memory: {
              id: params.memory_id,
              ...result,
              metadata: archivedMetadata,
            },
            message: 'Memory archived successfully',
          };
        }

        case 'get_by_id': {
          if (!params.memory_id) {
            return {
              success: false,
              action: 'get_by_id',
              message: 'Memory ID is required',
            };
          }

          const memory = await client.get(params.memory_id);
          
          if (!memory) {
            return {
              success: false,
              action: 'get_by_id',
              message: 'Memory not found',
            };
          }

          return {
            success: true,
            action: 'get_by_id',
            memory,
          };
        }

        case 'analyze_progress': {
          const filters = {
            AND: [
              { user_id: params.student_id || userId },
              ...(params.topic_filter ? [{ 'metadata.topic': params.topic_filter }] : []),
            ],
          };

          // Get all memories for progress analysis
          const allMemories = await client.getAll({
            user_id: params.student_id || userId,
            org_id: serverEnv.MEM0_ORG_ID,
            project_id: serverEnv.MEM0_PROJECT_ID,
          });

          // Analyze learning progress
          const progress = {
            total_memories: allMemories.length,
            by_type: {
              declarative: 0,
              episodic: 0,
              procedural: 0,
            },
            by_topic: {},
            average_understanding: 0,
            total_practice_count: 0,
            recent_activity: [],
          };

          let totalUnderstanding = 0;
          let understandingCount = 0;

          for (const memory of allMemories) {
            // Count by type
            const type = memory.metadata?.type;
            if (type && progress.by_type[type] !== undefined) {
              progress.by_type[type]++;
            }

            // Count by topic
            const topic = memory.metadata?.topic;
            if (topic) {
              progress.by_topic[topic] = (progress.by_topic[topic] || 0) + 1;
            }

            // Calculate understanding levels
            const understanding = memory.metadata?.learning_progress?.understanding_level;
            if (understanding !== undefined) {
              totalUnderstanding += understanding;
              understandingCount++;
            }

            // Sum practice counts
            const practiceCount = memory.metadata?.learning_progress?.practice_count;
            if (practiceCount) {
              progress.total_practice_count += practiceCount;
            }

            // Track recent activity
            if (memory.updated_at) {
              progress.recent_activity.push({
                memory_id: memory.id,
                topic: topic || 'unknown',
                type: type || 'unknown',
                updated_at: memory.updated_at,
              });
            }
          }

          // Calculate averages
          progress.average_understanding = understandingCount > 0 
            ? totalUnderstanding / understandingCount 
            : 0;

          // Sort recent activity by date
          progress.recent_activity.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          progress.recent_activity = progress.recent_activity.slice(0, 10);

          return {
            success: true,
            action: 'analyze_progress',
            progress,
            student_id: params.student_id || userId,
          };
        }

        default:
          return {
            success: false,
            action: params.action,
            message: 'Invalid action specified',
          };
      }
    } catch (error) {
      console.error('Enhanced memory operation error:', error);
      return {
        success: false,
        action: params.action,
        message: `Memory operation failed: ${error.message}`,
        error: error.toString(),
      };
    }
  },
});

// Export type definitions for use in other parts of the application
export type MemoryType = z.infer<typeof MemoryTypeEnum>;
export type MemoryMetadata = z.infer<typeof MemoryMetadataSchema>;
export type SearchParameters = z.infer<typeof SearchParametersSchema>;
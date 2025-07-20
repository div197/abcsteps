'use server'; // 🕉️ Server-side Karma Yoga

import { getUser } from '@/lib/auth-utils';
import { serverEnv } from '@/env/server';
import MemoryClient from 'mem0ai';
import { MemoryItem, MemoryResponse } from './memory-actions';

// 🌼 Enhanced types for Smriti protocol - Sacred Memory Classification
export type MemoryType = 'declarative' | 'episodic' | 'procedural';
export type MemoryLanguage = 'english' | 'hindi' | 'sanskrit' | 'mixed';

export interface SmritiMetadata {
  type: MemoryType;
  topic: string;
  sub_topic?: string;
  concept?: string;
  language: MemoryLanguage;
  tags?: string[];
  importance?: number;
  context?: string;
  learning_progress?: {
    understanding_level?: number;
    practice_count?: number;
    last_reviewed?: string;
  };
  sacred_schema?: string;
  created_by?: string;
  timestamp?: string;
  archived?: boolean;
  archived_at?: string;
  archived_by?: string;
  last_updated?: string;
  update_count?: number;
}

export interface EnhancedMemoryItem extends MemoryItem {
  metadata?: SmritiMetadata & Record<string, any>;
  relevance_score?: number;
  matched_query?: string;
}

export interface CategorizedMemories {
  declarative: EnhancedMemoryItem[];
  episodic: EnhancedMemoryItem[];
  procedural: EnhancedMemoryItem[];
  uncategorized: EnhancedMemoryItem[];
}

export interface EnhancedMemoryResponse extends MemoryResponse {
  categorized?: CategorizedMemories;
  search_metadata?: {
    queries_used: string[];
    filters_applied?: any;
  };
}

export interface LearningProgress {
  total_memories: number;
  by_type: {
    declarative: number;
    episodic: number;
    procedural: number;
  };
  by_topic: Record<string, number>;
  average_understanding: number;
  total_practice_count: number;
  recent_activity: Array<{
    memory_id: string;
    topic: string;
    type: string;
    updated_at: string;
  }>;
}

// Initialize the memory client
const memoryClient = new MemoryClient({ apiKey: serverEnv.MEM0_API_KEY || '' });

/**
 * Add an enhanced memory with Smriti protocol metadata
 */
export async function addEnhancedMemory(
  content: string,
  metadata: Partial<SmritiMetadata>
): Promise<EnhancedMemoryItem> {
  const user = await getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  try {
    // Prepare metadata with Smriti protocol structure
    const fullMetadata: SmritiMetadata = {
      type: metadata.type || 'declarative',
      topic: metadata.topic || 'general',
      language: metadata.language || 'english',
      importance: metadata.importance || 5,
      ...metadata,
      sacred_schema: 'smriti_v1',
      created_by: 'enhanced_memory_manager',
      timestamp: new Date().toISOString(),
    };

    const response = await memoryClient.add([{
      role: "user",
      content: content
    }], {
      user_id: user.id,
      org_id: serverEnv.MEM0_ORG_ID,
      project_id: serverEnv.MEM0_PROJECT_ID,
      metadata: fullMetadata,
      categories: [
        fullMetadata.type,
        fullMetadata.topic,
        ...(fullMetadata.tags || []),
      ],
    });

    if (response.length === 0) {
      throw new Error('Failed to add memory');
    }

    return {
      ...response[0],
      metadata: fullMetadata,
    };
  } catch (error) {
    console.error('Error adding enhanced memory:', error);
    throw error;
  }
}

/**
 * Holistic memory search with multiple queries and filters
 */
export async function holisticMemorySearch(
  queries: string[],
  filters?: {
    type?: MemoryType;
    topic?: string;
    sub_topic?: string;
    language?: MemoryLanguage;
    tags?: string[];
    importance_min?: number;
    date_range?: {
      start?: string;
      end?: string;
    };
  },
  limit = 20
): Promise<EnhancedMemoryResponse> {
  const user = await getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  if (!queries || queries.length === 0) {
    return { memories: [], total: 0 };
  }

  try {
    // Prepare search filters
    const baseFilters = {
      AND: [
        { user_id: user.id },
        ...(filters?.type ? [{ 'metadata.type': filters.type }] : []),
        ...(filters?.topic ? [{ 'metadata.topic': filters.topic }] : []),
        ...(filters?.language ? [{ 'metadata.language': filters.language }] : []),
      ],
    };

    // Perform holistic search with multiple queries
    const resultMap = new Map<string, EnhancedMemoryItem>();

    for (const query of queries) {
      const result = await memoryClient.search(query, {
        filters: baseFilters,
        api_version: 'v2',
        limit,
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
            const existing = resultMap.get(memory.id)!;
            if ((memory.score || 0) > existing.relevance_score!) {
              existing.relevance_score = memory.score || 0;
              existing.matched_query = query;
            }
          }
        }
      }
    }

    // Convert map to array and sort by relevance
    const sortedResults = Array.from(resultMap.values())
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, limit);

    // Categorize results by memory type
    const categorized: CategorizedMemories = {
      declarative: sortedResults.filter(m => m.metadata?.type === 'declarative'),
      episodic: sortedResults.filter(m => m.metadata?.type === 'episodic'),
      procedural: sortedResults.filter(m => m.metadata?.type === 'procedural'),
      uncategorized: sortedResults.filter(m => !m.metadata?.type),
    };

    return {
      memories: sortedResults,
      total: sortedResults.length,
      categorized,
      search_metadata: {
        queries_used: queries,
        filters_applied: filters,
      },
    };
  } catch (error) {
    console.error('Error performing holistic search:', error);
    throw error;
  }
}

/**
 * Update an existing memory with new content or metadata
 */
export async function updateMemory(
  memoryId: string,
  updates: {
    content?: string;
    metadata?: Partial<SmritiMetadata>;
  }
): Promise<EnhancedMemoryItem> {
  const user = await getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  try {
    // Get existing memory first
    const existingMemory = await memoryClient.get(memoryId);
    
    if (!existingMemory) {
      throw new Error('Memory not found');
    }

    // Merge metadata
    const updatedMetadata = {
      ...existingMemory.metadata,
      ...updates.metadata,
      last_updated: new Date().toISOString(),
      update_count: (existingMemory.metadata?.update_count || 0) + 1,
    };

    // Update the memory
    const result = await memoryClient.update(memoryId, {
      data: updates.content || existingMemory.memory,
      metadata: updatedMetadata,
    });

    return {
      id: memoryId,
      ...result,
      metadata: updatedMetadata,
    };
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
}

/**
 * Archive a memory (soft delete)
 */
export async function archiveMemory(memoryId: string): Promise<EnhancedMemoryItem> {
  const user = await getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  try {
    // Get existing memory
    const existingMemory = await memoryClient.get(memoryId);
    
    if (!existingMemory) {
      throw new Error('Memory not found');
    }

    // Update metadata to mark as archived
    const archivedMetadata = {
      ...existingMemory.metadata,
      archived: true,
      archived_at: new Date().toISOString(),
      archived_by: user.id,
    };

    const result = await memoryClient.update(memoryId, {
      metadata: archivedMetadata,
    });

    return {
      id: memoryId,
      ...result,
      metadata: archivedMetadata,
    };
  } catch (error) {
    console.error('Error archiving memory:', error);
    throw error;
  }
}

/**
 * Analyze learning progress for a student
 */
export async function analyzeLearningProgress(
  studentId?: string,
  topicFilter?: string
): Promise<LearningProgress> {
  const user = await getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const targetUserId = studentId || user.id;

  try {
    // Get all memories for progress analysis
    const allMemories = await memoryClient.getAll({
      user_id: targetUserId,
      org_id: serverEnv.MEM0_ORG_ID,
      project_id: serverEnv.MEM0_PROJECT_ID,
    });

    // Filter by topic if specified
    const filteredMemories = topicFilter
      ? allMemories.filter(m => m.metadata?.topic === topicFilter)
      : allMemories;

    // Analyze learning progress
    const progress: LearningProgress = {
      total_memories: filteredMemories.length,
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

    for (const memory of filteredMemories) {
      // Count by type
      const type = memory.metadata?.type as MemoryType;
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

    return progress;
  } catch (error) {
    console.error('Error analyzing learning progress:', error);
    throw error;
  }
}

/**
 * Get memories by type
 */
export async function getMemoriesByType(
  type: MemoryType,
  limit = 20
): Promise<EnhancedMemoryResponse> {
  const user = await getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  try {
    const filters = {
      AND: [
        { user_id: user.id },
        { 'metadata.type': type },
      ],
    };

    const result = await memoryClient.search('*', {
      filters,
      api_version: 'v2',
      limit,
    });

    if (!result || !result[0]) {
      return { memories: [], total: 0 };
    }

    const memories: EnhancedMemoryItem[] = result[0].map((item: any) => ({
      ...item,
      metadata: item.metadata,
    }));

    return {
      memories,
      total: memories.length,
    };
  } catch (error) {
    console.error('Error getting memories by type:', error);
    throw error;
  }
}
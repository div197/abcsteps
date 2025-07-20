/**
 * Tests for Enhanced Memory Manager
 * These tests can be run to verify the implementation
 */

import { enhancedMemoryManagerTool } from './memory-manager';

// Test configuration
const TEST_USER_ID = 'test-user-123';
const TEST_DELAY = 1000; // Delay between operations to avoid rate limits

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test 1: Add memories of all three types
export async function testAddAllMemoryTypes() {
  console.log('Testing: Add all memory types...');
  
  const results = {
    declarative: null,
    episodic: null,
    procedural: null,
  };

  try {
    // Add declarative memory
    results.declarative = await enhancedMemoryManagerTool.execute({
      action: 'add',
      content: 'Test: The speed of light is approximately 299,792,458 meters per second',
      metadata: {
        type: 'declarative',
        topic: 'Physics',
        sub_topic: 'Constants',
        concept: 'Speed of Light',
        language: 'english',
        tags: ['physics', 'constants', 'light'],
        importance: 10,
      },
    });
    console.log('✓ Declarative memory added:', results.declarative);

    await delay(TEST_DELAY);

    // Add episodic memory
    results.episodic = await enhancedMemoryManagerTool.execute({
      action: 'add',
      content: 'Test: I learned about the speed of light in physics class today. The teacher used a laser demonstration.',
      metadata: {
        type: 'episodic',
        topic: 'Physics',
        sub_topic: 'Learning Experience',
        language: 'english',
        tags: ['classroom', 'demonstration'],
        importance: 6,
      },
    });
    console.log('✓ Episodic memory added:', results.episodic);

    await delay(TEST_DELAY);

    // Add procedural memory
    results.procedural = await enhancedMemoryManagerTool.execute({
      action: 'add',
      content: 'Test: To calculate time = distance / speed of light. Example: Time for light to travel 1km = 1000m / 299,792,458 m/s',
      metadata: {
        type: 'procedural',
        topic: 'Physics',
        sub_topic: 'Calculations',
        concept: 'Light Travel Time',
        language: 'english',
        tags: ['calculation', 'formula'],
        importance: 8,
      },
    });
    console.log('✓ Procedural memory added:', results.procedural);

    return { success: true, results };
  } catch (error) {
    console.error('✗ Error adding memories:', error);
    return { success: false, error };
  }
}

// Test 2: Holistic search across memory types
export async function testHolisticSearch() {
  console.log('\nTesting: Holistic search...');

  try {
    const result = await enhancedMemoryManagerTool.execute({
      action: 'search',
      search_params: {
        queries: [
          'speed of light',
          'light physics',
          'physics constants',
        ],
        filters: {
          topic: 'Physics',
        },
        limit: 10,
      },
    });

    console.log('✓ Search completed');
    console.log('Total results:', result.results?.total || 0);
    console.log('Categorized results:', {
      declarative: result.results?.categorized?.declarative?.length || 0,
      episodic: result.results?.categorized?.episodic?.length || 0,
      procedural: result.results?.categorized?.procedural?.length || 0,
    });

    return { success: true, result };
  } catch (error) {
    console.error('✗ Error searching memories:', error);
    return { success: false, error };
  }
}

// Test 3: Update memory with progress
export async function testUpdateMemory(memoryId: string) {
  console.log('\nTesting: Update memory...');

  try {
    const result = await enhancedMemoryManagerTool.execute({
      action: 'update',
      memory_id: memoryId,
      updates: {
        metadata: {
          learning_progress: {
            understanding_level: 90,
            practice_count: 5,
            last_reviewed: new Date().toISOString(),
          },
          tags: ['reviewed', 'understood'],
        },
      },
    });

    console.log('✓ Memory updated:', result);
    return { success: true, result };
  } catch (error) {
    console.error('✗ Error updating memory:', error);
    return { success: false, error };
  }
}

// Test 4: Archive memory
export async function testArchiveMemory(memoryId: string) {
  console.log('\nTesting: Archive memory...');

  try {
    const result = await enhancedMemoryManagerTool.execute({
      action: 'archive',
      memory_id: memoryId,
    });

    console.log('✓ Memory archived:', result);
    return { success: true, result };
  } catch (error) {
    console.error('✗ Error archiving memory:', error);
    return { success: false, error };
  }
}

// Test 5: Analyze progress
export async function testAnalyzeProgress() {
  console.log('\nTesting: Analyze progress...');

  try {
    const result = await enhancedMemoryManagerTool.execute({
      action: 'analyze_progress',
      topic_filter: 'Physics',
    });

    console.log('✓ Progress analysis completed:');
    console.log('Total memories:', result.progress?.total_memories);
    console.log('By type:', result.progress?.by_type);
    console.log('Average understanding:', result.progress?.average_understanding);

    return { success: true, result };
  } catch (error) {
    console.error('✗ Error analyzing progress:', error);
    return { success: false, error };
  }
}

// Test 6: Type-filtered search
export async function testTypeFilteredSearch() {
  console.log('\nTesting: Type-filtered search...');

  try {
    const result = await enhancedMemoryManagerTool.execute({
      action: 'search',
      search_params: {
        queries: ['physics'],
        filters: {
          type: 'declarative',
          importance_min: 8,
        },
        limit: 5,
      },
    });

    console.log('✓ Type-filtered search completed');
    console.log('Declarative memories found:', result.results?.memories?.length || 0);

    return { success: true, result };
  } catch (error) {
    console.error('✗ Error in type-filtered search:', error);
    return { success: false, error };
  }
}

// Run all tests
export async function runAllTests() {
  console.log('=== Running Enhanced Memory Manager Tests ===\n');

  // Test 1: Add memories
  const addResults = await testAddAllMemoryTypes();
  await delay(TEST_DELAY);

  // Test 2: Search memories
  const searchResults = await testHolisticSearch();
  await delay(TEST_DELAY);

  // Test 3: Update memory (if we have a memory ID)
  if (addResults.success && addResults.results?.declarative?.memory?.id) {
    await testUpdateMemory(addResults.results.declarative.memory.id);
    await delay(TEST_DELAY);
  }

  // Test 4: Type-filtered search
  await testTypeFilteredSearch();
  await delay(TEST_DELAY);

  // Test 5: Analyze progress
  await testAnalyzeProgress();
  await delay(TEST_DELAY);

  // Test 6: Archive memory (if we have a memory ID)
  if (addResults.success && addResults.results?.episodic?.memory?.id) {
    await testArchiveMemory(addResults.results.episodic.memory.id);
  }

  console.log('\n=== Tests Completed ===');
}

// Export test functions
export const memoryTests = {
  testAddAllMemoryTypes,
  testHolisticSearch,
  testUpdateMemory,
  testArchiveMemory,
  testAnalyzeProgress,
  testTypeFilteredSearch,
  runAllTests,
};
/**
 * Enhanced Memory Manager Usage Examples
 * Implementing the Sacred Memory Schema (Smriti Protocol)
 */

import { enhancedMemoryManagerTool } from './memory-manager';
import type { MemoryType, MemoryMetadata } from './memory-manager-enhanced';

// Example 1: Adding Declarative Memory (Gyan - Facts/Knowledge)
async function addDeclarativeMemoryExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'add',
    content: 'The Pythagorean theorem states that in a right triangle, a² + b² = c²',
    metadata: {
      type: 'declarative',
      topic: 'Mathematics',
      sub_topic: 'Geometry',
      concept: 'Pythagorean Theorem',
      language: 'english',
      tags: ['theorem', 'geometry', 'triangles'],
      importance: 9,
      context: 'Fundamental concept in geometry used for calculating distances',
      learning_progress: {
        understanding_level: 85,
        practice_count: 5,
        last_reviewed: new Date().toISOString(),
      },
    },
  });
  return result;
}

// Example 2: Adding Episodic Memory (Bhava - Experiences/Events)
async function addEpisodicMemoryExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'add',
    content: 'During today\'s math class, I struggled with applying the Pythagorean theorem to word problems. The teacher showed a visual proof using squares that helped me understand better.',
    metadata: {
      type: 'episodic',
      topic: 'Mathematics',
      sub_topic: 'Learning Experience',
      language: 'english',
      tags: ['classroom', 'visual-learning', 'breakthrough-moment'],
      importance: 7,
      context: 'Personal learning experience that improved understanding',
      learning_progress: {
        understanding_level: 70,
        practice_count: 1,
        last_reviewed: new Date().toISOString(),
      },
    },
  });
  return result;
}

// Example 3: Adding Procedural Memory (Kriya - Skills/How-to)
async function addProceduralMemoryExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'add',
    content: 'To solve Pythagorean theorem problems: 1) Identify the right triangle, 2) Label the sides (a, b for legs, c for hypotenuse), 3) Substitute known values into a² + b² = c², 4) Solve for the unknown variable',
    metadata: {
      type: 'procedural',
      topic: 'Mathematics',
      sub_topic: 'Problem Solving',
      concept: 'Pythagorean Theorem Application',
      language: 'english',
      tags: ['step-by-step', 'problem-solving', 'methodology'],
      importance: 8,
      context: 'Systematic approach to solving Pythagorean theorem problems',
      learning_progress: {
        understanding_level: 90,
        practice_count: 10,
        last_reviewed: new Date().toISOString(),
      },
    },
  });
  return result;
}

// Example 4: Holistic Memory Search
async function holisticSearchExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'search',
    search_params: {
      // Multiple queries for comprehensive retrieval
      queries: [
        'Pythagorean theorem',
        'right triangle calculations',
        'a² + b² = c²',
        'geometry formulas',
      ],
      filters: {
        type: 'declarative', // Focus on factual knowledge
        topic: 'Mathematics',
        sub_topic: 'Geometry',
        importance_min: 7, // High importance memories only
      },
      limit: 10,
    },
  });
  return result;
}

// Example 5: Cross-Type Memory Search for Learning Journey
async function learningJourneySearchExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'search',
    search_params: {
      queries: [
        'Pythagorean theorem learning',
        'geometry understanding',
        'math breakthroughs',
      ],
      // No type filter - retrieve all types to see the full learning journey
      filters: {
        topic: 'Mathematics',
        date_range: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          end: new Date().toISOString(),
        },
      },
      limit: 20,
    },
  });
  return result;
}

// Example 6: Updating Memory with Progress
async function updateMemoryProgressExample(memoryId: string) {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'update',
    memory_id: memoryId,
    updates: {
      metadata: {
        learning_progress: {
          understanding_level: 95, // Improved understanding
          practice_count: 15, // More practice
          last_reviewed: new Date().toISOString(),
        },
        tags: ['mastered', 'confident'], // Add achievement tags
      },
    },
  });
  return result;
}

// Example 7: Archiving Old Memories
async function archiveOldMemoryExample(memoryId: string) {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'archive',
    memory_id: memoryId,
  });
  return result;
}

// Example 8: Analyzing Student Progress
async function analyzeProgressExample(studentId?: string) {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'analyze_progress',
    student_id: studentId, // Optional - defaults to current user
    topic_filter: 'Mathematics', // Optional - analyze specific topic
  });
  return result;
}

// Example 9: Mixed Language Memory (Sanskrit Terms)
async function addMixedLanguageMemoryExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'add',
    content: 'गणित (Ganita) means mathematics. The concept of शून्य (Shunya/Zero) was a major contribution of Indian mathematicians to the world.',
    metadata: {
      type: 'declarative',
      topic: 'Mathematics',
      sub_topic: 'History',
      concept: 'Indian Mathematical Contributions',
      language: 'mixed',
      tags: ['sanskrit', 'history', 'zero', 'ganita'],
      importance: 8,
      context: 'Cultural and historical context of mathematics',
    },
  });
  return result;
}

// Example 10: Complex Multi-Concept Search
async function complexSearchExample() {
  const result = await enhancedMemoryManagerTool.execute({
    action: 'search',
    search_params: {
      queries: [
        'mathematical theorems',
        'geometry concepts',
        'problem solving methods',
        'visual learning techniques',
        'Indian mathematics',
      ],
      filters: {
        tags: ['geometry', 'theorem'], // Must have at least one of these tags
        importance_min: 6,
      },
      limit: 30,
    },
  });

  // The result will contain:
  // - Total count of memories found
  // - Memories sorted by relevance score
  // - Categorized results by type (declarative, episodic, procedural)
  // - Search metadata showing which queries matched
  return result;
}

// Example Usage Pattern for a Learning Session
async function completeLearningSesssionExample() {
  // 1. Start by adding what was learned (declarative)
  const factMemory = await addDeclarativeMemoryExample();
  
  // 2. Record the experience (episodic)
  const experienceMemory = await addEpisodicMemoryExample();
  
  // 3. Document the procedure (procedural)
  const procedureMemory = await addProceduralMemoryExample();
  
  // 4. Search for related memories to reinforce learning
  const relatedMemories = await holisticSearchExample();
  
  // 5. Analyze progress
  const progress = await analyzeProgressExample();
  
  return {
    added: [factMemory, experienceMemory, procedureMemory],
    related: relatedMemories,
    progress: progress,
  };
}

// Export examples for documentation
export const memoryExamples = {
  addDeclarativeMemoryExample,
  addEpisodicMemoryExample,
  addProceduralMemoryExample,
  holisticSearchExample,
  learningJourneySearchExample,
  updateMemoryProgressExample,
  archiveOldMemoryExample,
  analyzeProgressExample,
  addMixedLanguageMemoryExample,
  complexSearchExample,
  completeLearningSesssionExample,
};
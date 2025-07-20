import { z } from 'zod';
import { tool } from 'ai';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Local memory implementation - no external API needed
const memoryTool = tool({
  name: 'memory_manager',
  description: 'Manage user memories locally in PostgreSQL',
  parameters: z.object({
    action: z.enum(['add', 'search', 'update', 'delete']),
    content: z.string().optional(),
    memoryId: z.string().optional(),
    query: z.string().optional(),
  }),
  execute: async ({ action, content, memoryId, query }, { user }) => {
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }

    try {
      switch (action) {
        case 'add':
          if (!content) return { error: 'Content required for adding memory' };
          
          // Simple memory storage in database
          const result = await db.execute(sql`
            INSERT INTO user_memories (user_id, content, created_at)
            VALUES (${user.id}, ${content}, NOW())
            RETURNING id, content, created_at
          `);
          
          return {
            success: true,
            memory: result.rows[0],
            message: 'Memory saved successfully!'
          };

        case 'search':
          const searchQuery = query || content || '';
          
          // Simple text search using PostgreSQL
          const memories = await db.execute(sql`
            SELECT id, content, created_at
            FROM user_memories
            WHERE user_id = ${user.id}
            AND content ILIKE ${'%' + searchQuery + '%'}
            ORDER BY created_at DESC
            LIMIT 10
          `);
          
          return {
            success: true,
            memories: memories.rows,
            count: memories.rows.length
          };

        case 'update':
          if (!memoryId || !content) {
            return { error: 'Memory ID and content required for update' };
          }
          
          const updated = await db.execute(sql`
            UPDATE user_memories
            SET content = ${content}, updated_at = NOW()
            WHERE id = ${memoryId} AND user_id = ${user.id}
            RETURNING id, content, updated_at
          `);
          
          return {
            success: true,
            memory: updated.rows[0],
            message: 'Memory updated successfully!'
          };

        case 'delete':
          if (!memoryId) {
            return { error: 'Memory ID required for deletion' };
          }
          
          await db.execute(sql`
            DELETE FROM user_memories
            WHERE id = ${memoryId} AND user_id = ${user.id}
          `);
          
          return {
            success: true,
            message: 'Memory deleted successfully!'
          };

        default:
          return { error: 'Invalid action' };
      }
    } catch (error) {
      console.error('Memory operation failed:', error);
      return { error: 'Memory operation failed' };
    }
  },
});

export { memoryTool as memoryManagerTool };
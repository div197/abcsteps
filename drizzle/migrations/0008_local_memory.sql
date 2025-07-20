-- Create local memory table to replace Mem0
CREATE TABLE IF NOT EXISTS user_memories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX idx_user_memories_content ON user_memories USING gin(to_tsvector('english', content));

-- Add to schema.ts:
-- export const userMemories = pgTable('user_memories', {
--   id: text('id').primaryKey().$defaultFn(() => generateId()),
--   userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
--   content: text('content').notNull(),
--   createdAt: timestamp('created_at').notNull().defaultNow(),
--   updatedAt: timestamp('updated_at').notNull().defaultNow(),
-- });
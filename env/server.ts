// Environment configuration for ABCSteps Vivek
// Using Supabase free tier + OpenRouter + Self-hosted Mem0
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const serverEnv = createEnv({
  server: {
    // AI Provider - OpenRouter (affordable with free models available)
    OPENROUTER_API_KEY: z.string().min(1),
    
    // Supabase Database (free tier: 500MB database, 2GB file storage)
    DATABASE_URL: z.string().min(1), // Supabase PostgreSQL connection string
    SUPABASE_URL: z.string().url().optional(), // For Supabase client features
    SUPABASE_ANON_KEY: z.string().optional(), // Public anon key
    
    // Authentication
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    
    // Optional OAuth providers
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    
    // Educational Tools (all have free tiers)
    OPENWEATHER_API_KEY: z.string().optional(), // 60 calls/min free
    
    // Billing (Polar for Rs 990/year subscription)
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
    
    // Optional services
    ELEVENLABS_API_KEY: z.string().optional(), // For premium TTS
    
    // CORS Configuration
    ALLOWED_ORIGINS: z.string().optional().default('http://localhost:3000'),
  },
  experimental__runtimeEnv: process.env,
})
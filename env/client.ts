// Minimal client environment for free service
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const clientEnv = createEnv({
  client: {
    // App URLs
    NEXT_PUBLIC_SITE_URL: z.string().url().optional().default('https://abcsteps.com'),
    NEXT_PUBLIC_APP_URL: z.string().url().optional().default('https://abcsteps.com'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
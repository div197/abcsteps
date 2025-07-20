// /lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Globe, Book, TelescopeIcon, GraduationCap } from 'lucide-react'
import { ChatsCircleIcon, CodeIcon, MemoryIcon, YoutubeLogoIcon } from '@phosphor-icons/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SearchGroupId = 'web' | 'analysis' | 'chat' | 'memory' | 'guru' | 'extreme';

export const searchGroups = [
  {
    id: 'memory' as const,
    name: 'Memory',
    description: 'Your personal memory companion',
    icon: MemoryIcon,
    show: true,
    requireAuth: true,
  },
  {
    id: 'analysis' as const,
    name: 'Analysis',
    description: 'Code and data analysis',
    icon: CodeIcon,
    show: true,
  },
  {
    id: 'chat' as const,
    name: 'Chat',
    description: 'Talk to the model directly.',
    icon: ChatsCircleIcon,
    show: true,
  },
  {
    id: 'guru' as const,
    name: 'Guru',
    description: 'Learn through Socratic questioning',
    icon: GraduationCap,
    show: true,
  },
  {
    id: 'web' as const,
    name: 'Tools',
    description: 'Weather, maps, translation and utilities',
    icon: Globe,
    show: true,
  },
  {
    id: 'extreme' as const,
    name: 'Extreme',
    description: 'Deep research with advanced search capabilities',
    icon: TelescopeIcon,
    show: true,
  },
] as const;

export type SearchGroup = typeof searchGroups[number];

export function invalidateChatsCache() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('invalidate-chats-cache');
    window.dispatchEvent(event);
  }
}
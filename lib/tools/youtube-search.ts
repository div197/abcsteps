import { tool } from 'ai';
import { z } from 'zod';

// 🎥 Free YouTube Search using YouTube Data API v3
// Free tier: 10,000 quota units/day (1 search = 100 units = 100 searches/day)
export const youtubeSearchTool = tool({
  description: `Search YouTube for educational videos and tutorials.
  This tool helps find relevant educational content, tutorials, and explanations.
  Use this when users ask for video tutorials, how-to guides, or visual learning content.`,
  parameters: z.object({
    query: z.string().describe('The search query for YouTube videos'),
    maxResults: z.number().optional().default(5).describe('Number of results to return (1-25)')
  }),
  execute: async ({ query, maxResults = 5 }) => {
    try {
      // Check if YouTube API key is configured
      if (!process.env.YOUTUBE_API_KEY) {
        console.warn('YouTube API not configured');
        return {
          videos: [],
          query,
          error: 'YouTube API key not configured',
          source: 'Configuration Error'
        };
      }

      // YouTube Data API v3 search endpoint
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${process.env.YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&maxResults=${Math.min(maxResults, 25)}&order=relevance&safeSearch=strict`;
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`YouTube API error: ${data.error.message}`);
      }
      
      const videos = (data.items || []).map((item: any) => ({
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        videoId: item.id.videoId,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      }));
      
      return {
        videos,
        query,
        totalResults: data.pageInfo?.totalResults || 0,
        source: 'YouTube Data API v3'
      };
      
    } catch (error: any) {
      console.error('YouTube search error:', error);
      return {
        videos: [],
        query,
        error: error.message || 'YouTube search failed',
        source: 'Error'
      };
    }
  },
});
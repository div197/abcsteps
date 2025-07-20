import { tool } from 'ai';
import { z } from 'zod';

// 🔍 Free Google Custom Search (100 searches/day)
// Alternative to expensive Tavily/Exa APIs
export const webSearchTool = tool({
  description: `Search the web for information using Google Custom Search.
  This tool provides comprehensive web search results from Google.
  Use this for general web searches, current information, and research queries.`,
  parameters: z.object({
    query: z.string().describe('The search query to look up information about'),
    num: z.number().optional().default(5).describe('Number of results to return (1-10)')
  }),
  execute: async ({ query, num = 5 }) => {
    try {
      // Use free DuckDuckGo search as fallback if no Google API key
      if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
        console.warn('Google Custom Search not configured, using DuckDuckGo');
        
        // Simple DuckDuckGo instant answers (free)
        const duckgoUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const duckgoResponse = await fetch(duckgoUrl);
        const duckgoData = await duckgoResponse.json();
        
        if (duckgoData.AbstractText || duckgoData.Answer) {
          return {
            results: [{
              title: duckgoData.Heading || query,
              snippet: duckgoData.AbstractText || duckgoData.Answer || '',
              url: duckgoData.AbstractURL || duckgoData.AnswerURL || '',
              source: 'DuckDuckGo'
            }],
            query,
            source: 'DuckDuckGo Instant Answer API (Free)'
          };
        }
        
        return {
          results: [],
          query,
          error: 'No Google API key configured and no DuckDuckGo results found',
          source: 'Fallback'
        };
      }

      // Use Google Custom Search API (100 free searches/day)
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${Math.min(num, 10)}`;
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Google Search API error: ${data.error.message}`);
      }
      
      const results = (data.items || []).map((item: any) => ({
        title: item.title,
        snippet: item.snippet || '',
        url: item.link,
        source: 'Google Search'
      }));
      
      return {
        results,
        query,
        totalResults: data.searchInformation?.totalResults || '0',
        searchTime: data.searchInformation?.searchTime || '0',
        source: 'Google Custom Search API'
      };
      
    } catch (error: any) {
      console.error('Web search error:', error);
      return {
        results: [],
        query,
        error: error.message || 'Search failed',
        source: 'Error'
      };
    }
  },
});
import { tool } from 'ai';
import { z } from 'zod';

// 📚 Free Academic Search using multiple free APIs
// Uses arXiv API (free) + CrossRef API (free) for academic papers
export const academicSearchTool = tool({
  description: `Search for academic papers and research publications.
  This tool searches arXiv, CrossRef, and other academic databases for scholarly content.
  Use this for research papers, academic citations, and scholarly information.`,
  parameters: z.object({
    query: z.string().describe('The academic search query'),
    maxResults: z.number().optional().default(5).describe('Number of results to return (1-20)')
  }),
  execute: async ({ query, maxResults = 5 }) => {
    try {
      const results: any[] = [];
      
      // 1. Search arXiv (free, no API key required)
      try {
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${Math.min(maxResults, 10)}&sortBy=relevance&sortOrder=descending`;
        const arxivResponse = await fetch(arxivUrl);
        const arxivText = await arxivResponse.text();
        
        // Parse arXiv XML response (simplified)
        const arxivMatches = arxivText.match(/<entry>.*?<\/entry>/gs) || [];
        
        for (const match of arxivMatches.slice(0, Math.min(maxResults, 5))) {
          const titleMatch = match.match(/<title>(.*?)<\/title>/s);
          const summaryMatch = match.match(/<summary>(.*?)<\/summary>/s);
          const linkMatch = match.match(/<id>(.*?)<\/id>/s);
          const authorMatch = match.match(/<name>(.*?)<\/name>/s);
          
          if (titleMatch && linkMatch) {
            results.push({
              title: titleMatch[1].replace(/\s+/g, ' ').trim(),
              abstract: summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim().substring(0, 200) + '...' : '',
              url: linkMatch[1].trim(),
              authors: authorMatch ? [authorMatch[1].trim()] : [],
              source: 'arXiv',
              type: 'preprint'
            });
          }
        }
      } catch (arxivError) {
        console.warn('arXiv search failed:', arxivError);
      }
      
      // 2. Search CrossRef for published papers (free, no API key required)
      try {
        const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${Math.min(maxResults, 5)}&sort=relevance&order=desc`;
        const crossrefResponse = await fetch(crossrefUrl, {
          headers: {
            'User-Agent': 'ABCStepsVivek/1.0 (https://abcsteps.com; mailto:contact@abcsteps.com)'
          }
        });
        
        if (crossrefResponse.ok) {
          const crossrefData = await crossrefResponse.json();
          
          for (const item of (crossrefData.message?.items || []).slice(0, Math.min(maxResults - results.length, 3))) {
            const authors = (item.author || []).map((author: any) => 
              `${author.given || ''} ${author.family || ''}`.trim()
            ).filter(Boolean);
            
            results.push({
              title: item.title?.[0] || 'Untitled',
              abstract: item.abstract || '',
              url: item.URL || `https://doi.org/${item.DOI}`,
              doi: item.DOI,
              authors: authors,
              journal: item['container-title']?.[0] || '',
              publishedDate: item.published?.['date-parts']?.[0]?.join('-') || '',
              source: 'CrossRef',
              type: 'journal_article'
            });
          }
        }
      } catch (crossrefError) {
        console.warn('CrossRef search failed:', crossrefError);
      }
      
      // If no results from academic sources, fall back to Google Scholar-style search
      if (results.length === 0) {
        try {
          // Use regular web search with site:scholar.google.com prefix
          const scholarQuery = `site:scholar.google.com ${query}`;
          console.log(`Falling back to general academic search for: ${query}`);
          
          results.push({
            title: `Academic search results for: ${query}`,
            abstract: 'No specific papers found in arXiv or CrossRef databases. Consider using more specific academic terms or author names.',
            url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
            authors: [],
            source: 'Google Scholar (fallback)',
            type: 'search_suggestion'
          });
        } catch (fallbackError) {
          console.warn('Fallback search failed:', fallbackError);
        }
      }
      
      return {
        papers: results,
        query,
        totalFound: results.length,
        sources: ['arXiv', 'CrossRef'],
        source: 'Multiple Academic Databases (Free APIs)'
      };
      
    } catch (error: any) {
      console.error('Academic search error:', error);
      return {
        papers: [],
        query,
        error: error.message || 'Academic search failed',
        source: 'Error'
      };
    }
  },
});
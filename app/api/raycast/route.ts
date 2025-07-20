import { serverEnv } from '@/env/server';
import { openai } from '@ai-sdk/openai';
import { tavily } from '@tavily/core';
import {
    convertToCoreMessages,
    tool,
    customProvider,
    generateText
} from 'ai';
import { z } from 'zod';

const vivek = customProvider({
    languageModels: {
        'vivek-default': openai('gpt-4o-mini'),
    }
})

export const maxDuration = 300;

const extractDomain = (url: string): string => {
    const urlPattern = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/i;
    return url.match(urlPattern)?.[1] || url;
};

const deduplicateByDomainAndUrl = <T extends { url: string }>(items: T[]): T[] => {
    const seenDomains = new Set<string>();
    const seenUrls = new Set<string>();

    return items.filter(item => {
        const domain = extractDomain(item.url);
        const isNewUrl = !seenUrls.has(item.url);
        const isNewDomain = !seenDomains.has(domain);

        if (isNewUrl && isNewDomain) {
            seenUrls.add(item.url);
            seenDomains.add(domain);
            return true;
        }
        return false;
    });
};

// Define separate system prompts for each group
const groupSystemPrompts = {
    web: `You are ABCSteps Vivek for Raycast, a powerful AI educational companion.

Today's Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}

### Core Guidelines:
- Always run the web_search tool first before composing your response.
- Provide concise, well-formatted educational responses optimized for Raycast's interface.
- Use markdown formatting for better readability.
- Avoid hallucinations or fabrications. Stick to verified educational content with proper citations.
- Respond in a clear, educational manner suitable for quick learning.

### Educational Search Guidelines:
- Always make multiple targeted queries (2-4) to get comprehensive educational resources.
- Never use the same query twice and always make more than 2 queries.
- Specify the year or "latest" in queries to fetch recent educational content.
- Place citations directly after relevant sentences or paragraphs.
- Citation format: [Source Title](URL)
- Ensure citations adhere strictly to the required format.

### Response Formatting:
- Start with a direct, educational answer to the user's question.
- Use markdown headings (h2, h3) to organize learning content.
- Present information in a logical, pedagogical flow with proper citations.
- Keep responses concise but informative, optimized for Raycast's interface.
- Use bullet points or numbered lists for clarity when appropriate.

### Latex and Currency Formatting:
- Use $ for inline equations and $$ for block equations.
- Use "USD" instead of $ for currency.

Remember, you are designed to be an efficient educational companion in the Raycast environment, providing quick access to learning resources.`
};

// Modify the POST function to use the new handler
export async function POST(req: Request) {
    const { messages, model, group = 'web' } = await req.json();

    console.log("Running with model: ", model.trim());
    console.log("Group: ", group);

    // Get the appropriate system prompt based on the group
    const systemPrompt = groupSystemPrompts[group as keyof typeof groupSystemPrompts];

    // Determine which tools to activate based on the group
    const activeTools = ["web_search" as const];

    const { text, steps } = await generateText({
        model: vivek.languageModel(model),
        system: systemPrompt,
        maxSteps: 5,
        messages: convertToCoreMessages(messages),
        temperature: 0,
        experimental_activeTools: activeTools,
        tools: {
            web_search: tool({
                description: 'Search the web for information with multiple queries, max results and search depth.',
                parameters: z.object({
                    queries: z.array(z.string().describe('Array of search queries to look up on the web.')),
                    maxResults: z.array(
                        z.number().describe('Array of maximum number of results to return per query.').default(10),
                    ),
                    topics: z.array(
                        z.enum(['general', 'news', "finance"]).describe('Array of topic types to search for.').default('general'),
                    ),
                    searchDepth: z.array(
                        z.enum(['basic', 'advanced']).describe('Array of search depths to use.').default('basic'),
                    ),
                    exclude_domains: z
                        .array(z.string())
                        .describe('A list of domains to exclude from all search results.')
                        .default([]),
                }),
                execute: async ({
                    queries,
                    maxResults,
                    topics,
                    searchDepth,
                    exclude_domains,
                }: {
                    queries: string[];
                    maxResults: number[];
                    topics: ('general' | 'news' | 'finance')[];
                    searchDepth: ('basic' | 'advanced')[];
                    exclude_domains?: string[];
                }) => {
                    const apiKey = serverEnv.TAVILY_API_KEY;
                    const tvly = tavily({ apiKey });

                    console.log('Queries:', queries);
                    console.log('Max Results:', maxResults);
                    console.log('Topics:', topics);
                    console.log('Search Depths:', searchDepth);
                    console.log('Exclude Domains:', exclude_domains);

                    // Execute searches in parallel
                    const searchPromises = queries.map(async (query, index) => {
                        const data = await tvly.search(query, {
                            topic: topics[index] || topics[0] || 'general',
                            days: topics[index] === 'news' ? 7 : undefined,
                            maxResults: maxResults[index] || maxResults[0] || 10,
                            searchDepth: searchDepth[index] || searchDepth[0] || 'basic',
                            includeAnswer: true,
                            excludeDomains: exclude_domains,
                        });


                        return {
                            query,
                            results: deduplicateByDomainAndUrl(data.results).map((obj: any) => ({
                                url: obj.url,
                                title: obj.title,
                                content: obj.content,
                                raw_content: obj.raw_content,
                                published_date: topics[index] === 'news' ? obj.published_date : undefined,
                            })),
                        };
                    });

                    const searchResults = await Promise.all(searchPromises);

                    return {
                        searches: searchResults,
                    };
                },
            }),
        }
    });

    console.log("Text: ", text);
    console.log("Steps: ", steps);

    return new Response(text);
}

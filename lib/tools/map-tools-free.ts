import { z } from 'zod';
import { tool } from 'ai';

// Use OpenStreetMap's free Nominatim API
const findPlaceOnMapTool = tool({
  name: 'find_place_on_map',
  description: 'Find places using free OpenStreetMap Nominatim API',
  parameters: z.object({
    query: z.string(),
    limit: z.number().default(5),
  }),
  execute: async ({ query, limit }) => {
    try {
      // Use OpenStreetMap's free Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=${limit}`,
        {
          headers: {
            'User-Agent': 'ABCSteps-Vivek-Educational-Platform/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const data = await response.json();

      return {
        success: true,
        places: data.map((place: any) => ({
          name: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          type: place.type,
          importance: place.importance,
        })),
        mapUrl: `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search location',
      };
    }
  },
});

export { findPlaceOnMapTool };
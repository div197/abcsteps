import { tool } from 'ai';
import { z } from 'zod';
import { serverEnv } from '@/env/server';

interface GoogleResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export const findPlaceOnMapTool = tool({
  description:
    'Find places using Google Maps geocoding API. Supports both address-to-coordinates (forward) and coordinates-to-address (reverse) geocoding.',
  parameters: z.object({
    query: z.string().nullable().describe('Address or place name to search for (for forward geocoding)'),
    latitude: z.number().nullable().describe('Latitude for reverse geocoding'),
    longitude: z.number().nullable().describe('Longitude for reverse geocoding'),
  }),
  execute: async ({ query, latitude, longitude }) => {
    try {
      const googleApiKey = serverEnv.GOOGLE_MAPS_API_KEY;

      if (!googleApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      let url: string;
      let searchType: 'forward' | 'reverse';

      if (query) {
        url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query,
        )}&key=${googleApiKey}`;
        searchType = 'forward';
      } else if (latitude !== undefined && longitude !== undefined) {
        url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;
        searchType = 'reverse';
      } else {
        throw new Error('Either query or coordinates (latitude/longitude) must be provided');
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OVER_QUERY_LIMIT') {
        return {
          success: false,
          error: 'Google Maps API quota exceeded. Please try again later.',
          places: [],
        };
      }

      if (data.status !== 'OK') {
        return {
          success: false,
          error: data.error_message || `Geocoding failed: ${data.status}`,
          places: [],
        };
      }

      const places = data.results.map((result: GoogleResult) => ({
        place_id: result.place_id,
        name: result.formatted_address.split(',')[0].trim(),
        formatted_address: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        types: result.types,
        address_components: result.address_components,
        viewport: result.geometry.viewport,
        source: 'google_maps',
      }));

      return {
        success: true,
        search_type: searchType,
        query: query || `${latitude},${longitude}`,
        places,
        count: places.length,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown geocoding error',
        places: [],
      };
    }
  },
});

 
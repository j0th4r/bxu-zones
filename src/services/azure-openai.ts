import { AzureOpenAI } from 'openai';
import { AZURE_OPENAI_CONFIG } from '../config/azure-openai';
import { SearchResult } from '../types/zoning';
import { SupplierInfo } from '../types/zoning';

/**
 * Azure OpenAI Service for handling AI-powered zoning search queries
 */
export class AzureOpenAIService {
  private client: AzureOpenAI;

  constructor() {
    // Initialize Azure OpenAI client with the provided configuration
    // Note: dangerouslyAllowBrowser is enabled for development/testing
    // In production, API calls should be made from a secure backend
    this.client = new AzureOpenAI({
      endpoint: AZURE_OPENAI_CONFIG.endpoint,
      apiKey: AZURE_OPENAI_CONFIG.apiKey,
      deployment: AZURE_OPENAI_CONFIG.deployment,
      apiVersion: AZURE_OPENAI_CONFIG.apiVersion,
      dangerouslyAllowBrowser: true // Enable browser usage (development only)
    });
  }

  /**
   * Process a zoning search query using Azure OpenAI
   * @param query - User's search query
   * @returns Promise<SearchResult> - Structured search results
   */
  async searchWithAI(query: string): Promise<SearchResult> {
    // Check if we should use backend proxy instead of direct calls
    if (AZURE_OPENAI_CONFIG.useBackendProxy) {
      console.log('Using backend proxy for AI search');
      return this.searchViaBackend(query);
    }

    console.log('Using direct Azure OpenAI connection');
    try {
      // Create the user prompt with context about Butuan City zoning
      const userPrompt = `
User Query: "${query}"

Task
please analyze this query in the context of Butuan City zoning regulations and provide: 

1. A clear, helpful summary addressing the user's question
2. Specific zoning information relevant to their query
3. Key highlights or important points to remember
4. If applicable, mention specific areas or parcels in Butuan City with their approximate coordinates

Important Butuan City landmarks with coordinates for reference:
- City Center/Capitol: [125.5431, 8.9512]
- J.C. Aquino Avenue (main commercial): [125.5400, 8.9500]
- National Highway: [125.5350, 8.9450]
- Butuan Bay area: [125.5200, 8.9600]
- University area: [125.5500, 8.9400]


Formatting rules

Return only valid JSON – no markdown, comments, or extra text.

Use approximate coordinates; place points near the most relevant landmark.

Ignore or politely decline to answer questions unrelated to zoning in Butuan City.

Example output:
{
  "summary": "Lot consolidation along J.C. Aquino Ave. is permissible, but street-front retail must occupy at least 60% of the ground floor.",
  "highlights": [
    "C-1 zoning allows mixed-use up to 6 storeys.",
    "Setback reduction to 2 m possible with design-review approval.",
    "Provide on-site parking: 1 space per 60 m² GFA."
  ],
  "parcels": [
    {
      "address": "Corner of J.C. Aquino Ave. and Montilla Blvd.",
      "zoneType": "C-1",
      "relevance": "Requested corner lot for planned mid-rise retail-office development.",
      "coordinates": [125.5410, 8.9495]
    }
    /* Up to four more parcel objects, if relevant */
  ]
}

`;

      // Call Azure OpenAI API - using deployment name instead of model name
      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment, // Use deployment name for Azure OpenAI
        messages: [
          {
            role: 'system',
            content: AZURE_OPENAI_CONFIG.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],

      });

      // Extract and parse the AI response
      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from Azure OpenAI');
      }

      // Try to parse JSON response from AI
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the raw text
        parsedResponse = {
          summary: aiResponse,
          highlights: ["AI analysis provided", "Check local regulations", "Contact planning department for specifics"],
          parcels: []
        };
      }

      // Transform AI response into SearchResult format
      const searchResult: SearchResult = {
        query,
        results: {
          parcels: parsedResponse.parcels?.map((parcel: any, index: number) => {
            // Create geometry object with coordinates if provided
            let geometry = null;
            if (parcel.coordinates && Array.isArray(parcel.coordinates) && parcel.coordinates.length === 2) {
              geometry = {
                type: 'Point',
                coordinates: parcel.coordinates // [longitude, latitude]
              };
            }

            return {
              id: `ai-parcel-${index}`,
              address: parcel.address || 'Butuan City area',
              zoneId: parcel.zoneType || 'unknown',
              geometry: geometry,
              attributes: {
                relevance: parcel.relevance || 'AI-identified relevant area',
                source: 'AI Analysis',
                coordinates: parcel.coordinates || null
              }
            };
          }) || [
            {
              id: 'ai-general',
              address: 'Butuan City',
              zoneId: 'various',
              geometry: {
                type: 'Point',
                coordinates: [125.5431, 8.9512] // Default to Butuan City center
              },
              attributes: {
                relevance: 'General zoning information for Butuan City',
                source: 'AI Analysis',
                coordinates: [125.5431, 8.9512]
              }
            }
          ],
          summary: parsedResponse.summary || aiResponse,
          highlights: parsedResponse.highlights || ["AI analysis completed", "Review local zoning codes", "Consult with planning officials"]
        }
      };

      return searchResult;

    } catch (error) {
      console.error('Azure OpenAI API Error:', error);
      
      // Return fallback response in case of API failure
      return {
        query,
        results: {
          parcels: [{
            id: 'error-fallback',
            address: 'Butuan City',
            zoneId: 'unknown',
            geometry: null,
            attributes: {
              error: 'AI service temporarily unavailable',
              source: 'Fallback'
            }
          }],
          summary: `I'm sorry, but I'm having trouble processing your query "${query}" at the moment. Please try again later or contact the planning department for assistance with zoning questions.`,
          highlights: [
            "AI service temporarily unavailable",
            "Try again in a few moments",
            "Contact local planning department for immediate assistance"
          ]
        }
      };
    }
  }

  /**
   * Search via backend API (production-safe approach)
   * @param query - User's search query
   * @returns Promise<SearchResult> - Structured search results
   */
  private async searchViaBackend(query: string): Promise<SearchResult> {
    try {
      const response = await fetch(AZURE_OPENAI_CONFIG.backendApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Backend API Error:', error);
      
      // Return fallback response
      return {
        query,
        results: {
          parcels: [{
            id: 'backend-error',
            address: 'Butuan City',
            zoneId: 'unknown',
            geometry: null,
            attributes: {
              error: 'Backend API temporarily unavailable',
              source: 'Backend Fallback'
            }
          }],
          summary: `I'm sorry, but the AI service is temporarily unavailable. Please try again later or contact the planning department for assistance with your query: "${query}".`,
          highlights: [
            "Backend API temporarily unavailable",
            "Try again in a few moments",
            "Contact local planning department for immediate assistance"
          ]
        }
      };
    }
  }

  /**
   * Test the Azure OpenAI connection
   * @returns Promise<boolean> - True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    // If using backend proxy, test the backend endpoint
    if (AZURE_OPENAI_CONFIG.useBackendProxy) {
      try {
        const response = await fetch(`${AZURE_OPENAI_CONFIG.backendApiUrl}/health`, {
          method: 'GET'
        });
        return response.ok;
      } catch (error) {
        console.error('Backend connection test failed:', error);
        return false;
      }
    }

    // Test direct Azure OpenAI connection
    try {
      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment, // Use deployment name for Azure OpenAI
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test. Please respond with "Connection successful".'
          }
        ],
        max_tokens: 50,
        temperature: 0
      });

      return response.choices[0]?.message?.content?.includes('Connection successful') || false;
    } catch (error) {
      console.error('Azure OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Get the nearest building/material supplier contact information using Azure OpenAI.
   * The AI must return ONLY valid JSON in the form:
   * {
   *   "name": "<Full Filipino name>",
   *   "phone": "+63 9XX XXX XXXX",
   *   "business": "<Business name>",
   *   "address": "<Supplier address>",
   *   "distance_km": <number>
   * }
   * @param location Free-form location string (address or description of the clicked spot)
   */
  async getNearestSuppliers(location: string, need?: string): Promise<SupplierInfo> {
    try {
      const userPrompt = `The user clicked the map at or near: "${location}".

Task:
Identify the single most relevant nearby business, establishment, or supplier related to the user's interest${need ? `: "${need}"` : ''}.

If no clear interest is provided, default to a construction or building–materials supplier.

Generate:
- A realistic full Filipino contact person name.
- A fake but plausible Philippine mobile number in the format "+63 9XX XXX XXXX".
- A short address or landmark description.
- The straight-line distance from the clicked location expressed as a number in kilometres with one decimal place.

Return ONLY valid JSON with the EXACT keys: name, phone, business, address, distance_km (number). No markdown, no comments.`;

      const response = await this.client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.deployment,
        messages: [
          {
            role: 'system',
            content: AZURE_OPENAI_CONFIG.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],

      });

      const aiResponse = response.choices[0]?.message?.content?.trim();
      if (!aiResponse) {
        throw new Error('No response from Azure OpenAI');
      }

      // Attempt to parse JSON.
      let supplier: SupplierInfo;
      try {
        supplier = JSON.parse(aiResponse) as SupplierInfo;
      } catch (err) {
        console.warn('Failed to parse supplier JSON, falling back to mock', err);
        // Provide a mock supplier if JSON parsing fails
        supplier = {
          name: 'Juan Dela Cruz',
          phone: '+63 912 345 6789',
          business: 'Generic Supplier',
          address: 'J.C. Aquino Ave., Butuan City',
          distance_km: 1.5
        };
      }

      return supplier;
    } catch (error) {
      console.error('Azure OpenAI supplier lookup error:', error);
      return {
        name: 'Maria Santos',
        phone: '+63 917 654 3210',
        business: 'Fallback Construction Depot',
        address: 'Downtown Butuan City',
        distance_km: 2.0
      };
    }
  }
}

// Export a singleton instance
export const azureOpenAIService = new AzureOpenAIService(); 
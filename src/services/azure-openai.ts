import { AzureOpenAI } from 'openai';
import { AZURE_OPENAI_CONFIG } from '../config/azure-openai';
import { SearchResult } from '../types/zoning';

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

Please analyze this query in the context of Butuan City zoning regulations and provide:

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

Format your response as a JSON object with this structure:
{
  "summary": "A comprehensive answer to the user's question",
  "highlights": ["Key point 1", "Key point 2", "Key point 3"],
  "parcels": [
    {
      "address": "Specific address if relevant",
      "zoneType": "R-1, C-1, MU, I-1, or OS",
      "relevance": "Why this parcel is relevant to the query",
      "coordinates": [longitude, latitude] // Use approximate coordinates for Butuan City locations
    }
  ]
}

For coordinates, use approximate values based on the area mentioned:
- Format: [longitude, latitude] (longitude first, then latitude)
- Butuan City range: longitude 125.50-125.60, latitude 8.90-8.98
- Place coordinates near known landmarks when possible

Keep the summary conversational but informative, and ensure highlights are actionable insights.
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
        max_tokens: AZURE_OPENAI_CONFIG.maxTokens,
        temperature: AZURE_OPENAI_CONFIG.temperature
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
}

// Export a singleton instance
export const azureOpenAIService = new AzureOpenAIService(); 
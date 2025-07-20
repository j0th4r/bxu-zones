import { ZONING_DEFINITIONS } from '../config/zoning-colors';
import { SearchResult } from '../types/zoning';
import { azureOpenAIService } from '../services/azure-openai';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ZoningAPI {
  static async getZoningDistricts() {
    // Return standardized zoning data with consistent colors
    return ZONING_DEFINITIONS.map(zone => ({
      id: zone.id,
      name: zone.name,
      type: zone.type,
      color: zone.color,
      description: zone.description,
      allowedUses: [...zone.allowedUses], // Convert readonly array to mutable array
      bulkRules: zone.bulkRules
    }));
  }

  static async searchWithAI(query: string): Promise<SearchResult> {
    // Use Azure OpenAI service for real AI-powered search
    return await azureOpenAIService.searchWithAI(query);
  }

  static async getParcelDetails(parcelId: string) {
    // Mock parcel details - replace with actual API call
    return {
      id: parcelId,
      address: 'Butuan Freedom Park, J.C. Aquino Avenue',
      owner: 'City Government of Butuan',
      lotSize: '12,000 sq m', // Approximate; update with actual if known
      zoning: 'OS', // Open Space zoning
      allowedUses: [
        'Public gatherings',
        'Recreational activities',
        'Civic events',
        'Park and landscaping',
      ],
      currentUse: 'Public park and civic space',
      lastUpdated: '2025-07-18',
    };
  }
}
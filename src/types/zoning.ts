export interface ZoningDistrict {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed-use' | 'manufacturing' | 'open-space';
  color: string;
  description: string;
  allowedUses: string[];
  bulkRules: {
    maxHeight: string;
    farRatio: string;
    lotCoverage: string;
    setbacks: {
      front: string;
      side: string;
      rear: string;
    };
  };
}

export interface Parcel {
  id: string;
  address: string;
  zoneId: string;
  geometry: any;
  attributes: Record<string, any>;
}

export interface SafetyRequirement {
  title: string; // e.g., "Electrical Safety"
  details: string; // detailed guidance
}

export interface SearchResult {
  query: string;
  results: {
    parcels: Parcel[];
    summary: string;
    highlights: string[];
    safetyRequirements?: SafetyRequirement[];
  };
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer' | 'editor';
  permissions: string[];
}

// Contact information for a supplier returned by the AI
export interface SupplierInfo {
  /** Full Filipino name of the contact person */
  name: string;
  /** Fake but realistic Philippine mobile phone number (+63 format) */
  phone: string;
  /** Business name or type of supplier */
  business: string;
  /** Physical address or description of the establishment */
  address: string;
  /** Straight-line distance from the queried parcel in kilometres */
  distance_km: number;
}

// Multiple suppliers response
export interface SuppliersResponse {
  /** Array of supplier information (3-5 suppliers maximum) */
  suppliers: SupplierInfo[];
  /** The location/address that was searched for */
  searchLocation: string;
  /** The context query used for the search */
  contextQuery?: string;
}

// Business rating for parcels
export interface BusinessRating {
  /** Parcel ID */
  parcelId: string;
  /** Parcel address for display */
  address: string;
  /** Rating percentage (0-100) */
  rating: number;
  /** AI-generated explanation for the rating */
  explanation: string;
  /** Factors that influenced the rating */
  factors: {
    accessibility: number;
    footTraffic: number;
    demographics: number;
    competition: number;
    infrastructure: number;
  };
  /** Overall ranking among compared parcels (1 = best) */
  rank: number;
}

// Business rating comparison response
export interface BusinessRatingResponse {
  /** Array of parcel ratings */
  ratings: BusinessRating[];
  /** Summary of the comparison */
  summary: string;
  /** Analysis methodology used */
  methodology: string;
}
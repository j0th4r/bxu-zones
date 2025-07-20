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

export interface SearchResult {
  query: string;
  results: {
    parcels: Parcel[];
    summary: string;
    highlights: string[];
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
// Standardized zoning colors and types for Butuan City
export const ZONING_COLORS = {
  // Residential zones
  'R-1': '#9333ea', // Purple for residential
  'Residential (R6-R8)': '#9333ea', // Same purple for consistency
  
  // Commercial zones  
  'C-1': '#dc2626', // Red for commercial
  'Commercial (C4-C6)': '#dc2626', // Same red for consistency
  
  // Mixed Use zones
  'MU': '#ec4899', // Pink for mixed use
  'Mixed Use (MU)': '#ec4899', // Same pink for consistency
  
  // Industrial zones
  'I-1': '#6b7280', // Gray for industrial
  'Manufacturing (M1)': '#6b7280', // Same gray for consistency
  
  // Open Space zones
  'OS': '#16a34a', // Green for open space
  'Open Space': '#16a34a', // Same green for consistency
} as const;

export const ZONING_DEFINITIONS = [
  {
    id: 'r6-r8',
    name: 'Residential (R6-R8)',
    shortName: 'R-1',
    type: 'residential' as const,
    color: ZONING_COLORS['R-1'],
    description: 'Single-family and multi-family residential developments',
    allowedUses: ['Single-family homes', 'Duplex units', 'Townhouses', 'Low-rise apartments'],
    bulkRules: {
      maxHeight: '15 meters (2-3 stories)',
      farRatio: '2.5',
      lotCoverage: '70%',
      setbacks: { front: '3 meters', side: '2 meters', rear: '3 meters' }
    }
  },
  {
    id: 'c4-c6',
    name: 'Commercial (C4-C6)',
    shortName: 'C-1', 
    type: 'commercial' as const,
    color: ZONING_COLORS['C-1'],
    description: 'Retail, office, and business establishments',
    allowedUses: ['Retail stores', 'Offices', 'Restaurants', 'Banks', 'Service centers'],
    bulkRules: {
      maxHeight: '25 meters (6-8 stories)',
      farRatio: '4.0',
      lotCoverage: '80%',
      setbacks: { front: '0 meters', side: '1.5 meters', rear: '3 meters' }
    }
  },
  {
    id: 'mx',
    name: 'Mixed Use (MU)', 
    shortName: 'MU',
    type: 'mixed-use' as const,
    color: ZONING_COLORS['MU'],
    description: 'Combined residential and commercial activities',
    allowedUses: ['Residential units', 'Ground floor retail', 'Live-work spaces', 'Small offices'],
    bulkRules: {
      maxHeight: '20 meters (4-5 stories)',
      farRatio: '3.5',
      lotCoverage: '70%',
      setbacks: { front: '1.5 meters', side: '2 meters', rear: '3 meters' }
    }
  },
  {
    id: 'm1',
    name: 'Manufacturing (M1)',
    shortName: 'I-1',
    type: 'manufacturing' as const,
    color: ZONING_COLORS['I-1'],
    description: 'Light industrial and manufacturing facilities',
    allowedUses: ['Light manufacturing', 'Warehouses', 'Processing facilities', 'Logistics centers'],
    bulkRules: {
      maxHeight: '18 meters (4-5 stories)',
      farRatio: '2.5',
      lotCoverage: '75%',
      setbacks: { front: '5 meters', side: '3 meters', rear: '5 meters' }
    }
  },
  {
    id: 'os',
    name: 'Open Space',
    shortName: 'OS',
    type: 'open-space' as const,
    color: ZONING_COLORS['OS'],
    description: 'Parks, recreation, and environmental protection areas',
    allowedUses: ['Public parks', 'Recreation facilities', 'Environmental conservation', 'Green corridors'],
    bulkRules: {
      maxHeight: '10 meters (2 stories)',
      farRatio: '0.5',
      lotCoverage: '15%',
      setbacks: { front: '10 meters', side: '5 meters', rear: '10 meters' }
    }
  }
] as const;

// Helper function to get color by zone type
export const getZoneColor = (zoneType: string): string => {
  return ZONING_COLORS[zoneType as keyof typeof ZONING_COLORS] || '#64748b';
};

// Accurate Butuan City coordinates for proper zoning areas
export const BUTUAN_COORDINATES = {
  center: [125.5431274, 8.9511601] as [number, number],
  bounds: {
    north: 8.9600,
    south: 8.9400, 
    east: 125.5600,
    west: 125.5200
  }
} as const; 
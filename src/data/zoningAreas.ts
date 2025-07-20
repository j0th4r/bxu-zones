// Shared zoning areas data used by both MapComponent and MapControls
export const zoningAreas = [
  // RESIDENTIAL ZONES (R-1)
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.52098448844048, 8.943387400695183],
          [125.524353343076, 8.943853729963644],
          [125.52538895047472, 8.93833131506232],
          [125.53286143978636, 8.939927013713287],
          [125.54006968184862, 8.921349808513076],
          [125.52206122876693, 8.921643150966162],
          [125.52098448844048, 8.943387400695183],
        ],
      ],
    },
    properties: {
      id: 'r1-001',
      zoneType: 'R-1',
      zoneName: 'Residential Zone - Villa Kananga',
      description: 'Single and multi-family residential development',
      address: 'Villa Kananga Subdivision, Butuan City',
      regulations: 'Max height: 15 meters, FAR: 2.5, Lot coverage: 70%',
      objectId: 1,
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.528, 8.952],
          [125.531, 8.9522],
          [125.5315, 8.9518],
          [125.5317, 8.9513],
          [125.5314, 8.9508],
          [125.5308, 8.9505],
          [125.5302, 8.9506],
          [125.5295, 8.9509],
          [125.529, 8.9513],
          [125.5288, 8.9518],
          [125.528, 8.952],
        ],
      ],
    },
    properties: {
      id: 'r1-002',
      zoneType: 'R-1',
      zoneName: 'Residential Zone - Banza District',
      description: 'Family residential area with modern amenities',
      address: 'Banza District, Butuan City',
      regulations: 'Max height: 15 meters, FAR: 2.5, Lot coverage: 70%',
      objectId: 2,
    },
  },

  // COMMERCIAL ZONES (C-1)
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.542, 8.953],
          [125.5445, 8.9532],
          [125.545, 8.9528],
          [125.5452, 8.9523],
          [125.5449, 8.9518],
          [125.5444, 8.9515],
          [125.5438, 8.9516],
          [125.5432, 8.9519],
          [125.5428, 8.9523],
          [125.5427, 8.9528],
          [125.542, 8.953],
        ],
      ],
    },
    properties: {
      id: 'c1-001',
      zoneType: 'C-1',
      zoneName: 'Commercial Zone - J.C. Aquino Avenue',
      description: 'Main commercial strip with retail and offices',
      address: 'J.C. Aquino Avenue, Butuan City',
      regulations: 'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
      objectId: 3,
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.545, 8.95],
          [125.5475, 8.9502],
          [125.548, 8.9498],
          [125.5482, 8.9493],
          [125.5479, 8.9488],
          [125.5474, 8.9485],
          [125.5468, 8.9486],
          [125.5462, 8.9489],
          [125.5458, 8.9493],
          [125.5457, 8.9498],
          [125.545, 8.95],
        ],
      ],
    },
    properties: {
      id: 'c1-002',
      zoneType: 'C-1',
      zoneName: 'Commercial Zone - Downtown Center',
      description: 'Central business and shopping district',
      address: 'Downtown Center, Butuan City',
      regulations: 'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
      objectId: 4,
    },
  },

  // MIXED USE ZONES (MU)
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.539, 8.952],
          [125.5415, 8.9522],
          [125.542, 8.9518],
          [125.5422, 8.9513],
          [125.5419, 8.9508],
          [125.5414, 8.9505],
          [125.5408, 8.9506],
          [125.5402, 8.9509],
          [125.5398, 8.9513],
          [125.5397, 8.9518],
          [125.539, 8.952],
        ],
      ],
    },
    properties: {
      id: 'mu-001',
      zoneType: 'MU',
      zoneName: 'Mixed Use Zone - Poblacion Heritage',
      description: 'Historic mixed use with residential and commercial',
      address: 'Poblacion Heritage District, Butuan City',
      regulations: 'Max height: 20 meters, FAR: 3.5, Lot coverage: 70%',
      objectId: 5,
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.548, 8.9545],
          [125.5505, 8.9547],
          [125.551, 8.9543],
          [125.5512, 8.9538],
          [125.5509, 8.9533],
          [125.5504, 8.953],
          [125.5498, 8.9531],
          [125.5492, 8.9534],
          [125.5488, 8.9538],
          [125.5487, 8.9543],
          [125.548, 8.9545],
        ],
      ],
    },
    properties: {
      id: 'mu-002',
      zoneType: 'MU',
      zoneName: 'Mixed Use Zone - Golden Ribbon',
      description: 'Modern mixed development with live-work spaces',
      address: 'Golden Ribbon District, Butuan City',
      regulations: 'Max height: 20 meters, FAR: 3.5, Lot coverage: 70%',
      objectId: 6,
    },
  },

  // INDUSTRIAL ZONES (I-1)
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.475, 8.948],
          [125.478, 8.9482],
          [125.479, 8.9478],
          [125.4792, 8.9472],
          [125.4789, 8.9466],
          [125.4783, 8.9462],
          [125.4775, 8.946],
          [125.4765, 8.9462],
          [125.4758, 8.9466],
          [125.4756, 8.9472],
          [125.475, 8.9478],
          [125.475, 8.948],
        ],
      ],
    },
    properties: {
      id: 'i1-001',
      zoneType: 'I-1',
      zoneName: 'Industrial Zone - Bancasi Area',
      description: 'Light industrial and logistics facilities',
      address: 'Bancasi Industrial Area, Butuan City',
      regulations: 'Max height: 18 meters, FAR: 2.5, Lot coverage: 75%',
      objectId: 7,
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.555, 8.945],
          [125.558, 8.9452],
          [125.559, 8.9448],
          [125.5592, 8.9442],
          [125.5589, 8.9436],
          [125.5583, 8.9432],
          [125.5575, 8.943],
          [125.5565, 8.9432],
          [125.5558, 8.9436],
          [125.5556, 8.9442],
          [125.555, 8.9448],
          [125.555, 8.945],
        ],
      ],
    },
    properties: {
      id: 'i1-002',
      zoneType: 'I-1',
      zoneName: 'Industrial Zone - Eastern District',
      description: 'Manufacturing and processing facilities',
      address: 'Eastern Industrial District, Butuan City',
      regulations: 'Max height: 18 meters, FAR: 2.5, Lot coverage: 75%',
      objectId: 8,
    },
  },

  // OPEN SPACE ZONES (OS)
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.543, 8.956],
          [125.5455, 8.9562],
          [125.546, 8.9558],
          [125.5462, 8.9553],
          [125.5459, 8.9548],
          [125.5454, 8.9545],
          [125.5448, 8.9546],
          [125.5442, 8.9549],
          [125.5438, 8.9553],
          [125.5437, 8.9558],
          [125.543, 8.956],
        ],
      ],
    },
    properties: {
      id: 'os-001',
      zoneType: 'OS',
      zoneName: 'Open Space - Magsaysay Park',
      description: 'Public park and recreational facilities',
      address: 'Magsaysay Park, Butuan City',
      regulations: 'Max height: 10 meters, FAR: 0.5, Lot coverage: 15%',
      objectId: 9,
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.532, 8.958],
          [125.535, 8.9583],
          [125.5365, 8.9581],
          [125.5375, 8.9578],
          [125.5378, 8.9573],
          [125.5375, 8.9568],
          [125.5368, 8.9565],
          [125.5358, 8.9564],
          [125.5348, 8.9566],
          [125.5338, 8.9569],
          [125.533, 8.9573],
          [125.5327, 8.9578],
          [125.532, 8.958],
        ],
      ],
    },
    properties: {
      id: 'os-002',
      zoneType: 'OS',
      zoneName: 'Open Space - Agusan River Buffer',
      description: 'Protected environmental zone along the river',
      address: 'Agusan River Buffer Zone, Butuan City',
      regulations: 'Max height: 10 meters, FAR: 0.5, Lot coverage: 15%',
      objectId: 10,
    },
  },
];

// Helper function to parse FAR and height from regulations
export const parseRegulations = (regulations: string) => {
  const farMatch = regulations.match(/FAR:\s*([0-9.]+)/);
  const heightMatch = regulations.match(/Max height:\s*(\d+)\s*meters/);

  const far = farMatch ? parseFloat(farMatch[1]) : 0;
  const heightMeters = heightMatch ? parseInt(heightMatch[1]) : 0;
  const heightStories = Math.ceil(heightMeters / 3); // Assuming 3m per story

  return {
    far,
    height: `${heightStories} stories`,
    heightMeters: `${heightMeters} meters`,
  };
};

// Convert zoning areas to analysis format
export const getZoningAnalysisData = () => {
  const uniqueZoneTypes = [
    ...new Set(zoningAreas.map((area) => area.properties.zoneType)),
  ];

  const zoningDistricts = uniqueZoneTypes
    .map((zoneType) => {
      const area = zoningAreas.find((a) => a.properties.zoneType === zoneType);
      if (!area) return null;

      const regulations = parseRegulations(area.properties.regulations);

      return {
        code: area.properties.zoneType,
        name: area.properties.zoneName.split(' - ')[0], // Remove location part
        far: regulations.far,
        height: regulations.height,
      };
    })
    .filter(
      (district): district is NonNullable<typeof district> => district !== null
    );

  return {
    zoningDistricts,
    landUsePatterns:
      'Butuan City demonstrates a typical Philippine urban pattern with concentrated commercial zones along major streets (J.C. Aquino Avenue), residential subdivisions in quieter areas, and institutional zones for education and government. The mix creates walkable neighborhoods with good access to services.',
    developmentPotential:
      'The C-1 Commercial zones allow development up to 25 meters with FAR 4.0, indicating significant vertical development potential. Mixed-use zones encourage transit-oriented development. The various residential zones provide housing density options from low to high density development.',
    relevantSections: [
      'R.A. 7279 - Urban Development & Housing Act',
      'P.D. 1096 - National Building Code',
      'Butuan City Zoning Ordinance 2023',
    ],
  };
};

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
          [125.5283264838572, 8.9523868878934],
          [125.52939936738169, 8.949673754665726],
          [125.53555771881226, 8.952005354756059],
          [125.53626582193843, 8.952047747346631],
          [125.53643748330235, 8.951369465304447],
          [125.5393480532455, 8.951307326849555],
          [125.53945335214786, 8.952624866359034],
          [125.53611888690683, 8.952751997111859],
          [125.53549333082925, 8.955474833493545],
          [125.53460440824408, 8.956503986802003],
          [125.52829453817228, 8.952297340211162],
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
          [125.52523253043829, 8.938613816641144],
          [125.52759287419214, 8.938698604936686],
          [125.52664873669062, 8.949085021798973],
          [125.52926657249036, 8.949636129515342],
          [125.52803620340833, 8.953338101918416],
          [125.52669000336365, 8.953847385607101],
          [125.52634629271395, 8.954498135949136],
          [125.52325289686665, 8.953451276133084],
          [125.52491416500686, 8.945047994943849],
          [125.52428402881574, 8.94493481811525],
          [125.52523253043829, 8.938613816641144],
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
 
];

// Check for duplicate IDs
const idSet = new Set<string>();
const duplicateIds: string[] = [];

zoningAreas.forEach(area => {
  const id = area.properties.id;
  if (idSet.has(id)) {
    duplicateIds.push(id);
  } else {
    idSet.add(id);
  }
});

if (duplicateIds.length > 0) {
  console.warn('WARNING: Duplicate IDs found in zoningAreas:', duplicateIds);
}

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

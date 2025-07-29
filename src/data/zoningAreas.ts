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
      regulations:
        'Max height: 15 meters, FAR: 2.5, Lot coverage: 70%',
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
      regulations:
        'Max height: 15 meters, FAR: 2.5, Lot coverage: 70%',
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
      regulations:
        'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
      objectId: 3,
    },
  },

  // MIXED USE ZONES (MU-1)
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.53797377295838, 8.939923645691943],
          [125.539561640645, 8.94458695586124],
          [125.54005516708813, 8.944269004792462],
          [125.54175032313198, 8.944247808044665],
          [125.54526938124827, 8.944035840498854],
          [125.54490460083377, 8.943315149919982],
          [125.54269446067538, 8.942403686262523],
          [125.54256571464673, 8.941661795554655],
          [125.54299486807555, 8.940050827670488],
          [125.53801668830124, 8.939860054685997],
          [125.53874624913023, 8.943421133918115],
          [125.53797377295838, 8.939923645691943],
        ],
      ],
    },
    properties: {
      id: 'mu-001',
      zoneType: 'MU',
      zoneName: 'Mixed Use Zone - Golden Ribbon',
      description: 'Main commercial strip with retail and offices',
      address: 'Golden Ribbon, Butuan City',
      regulations:
        'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
      objectId: 4,
    },
  },

  // OPEN SPACE ZONES
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.54427156305476, 8.957182882481796],
          [125.54468401147786, 8.954295462091405],
          [125.54646485685676, 8.950044177639855],
          [125.5480972984541, 8.952243124077425],
          [125.55838662731007, 8.954344327141046],
          [125.55808981974691, 8.955175031980167],
          [125.55650684607676, 8.955517086362299],
          [125.55462706484346, 8.96045240662245],
          [125.54427156305476, 8.957182882481796],
        ],
      ],
    },
    properties: {
      id: 'os-001',
      zoneType: 'OS',
      zoneName: 'Open Space - Baan Riverside',
      description: 'Main commercial strip with retail and offices',
      address: 'Baan Riverside, Butuan City',
      regulations:
        'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
      objectId: 5,
    },
  },

  // MANUFACTURING ZONES
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [125.53285211287657, 8.939776190895744],
          [125.53998248827618, 8.921459456423488],
          [125.55253172660258, 8.921149520893671],
          [125.54996959044428, 8.932255379729302],
          [125.54787805072324, 8.935044705083568],
          [125.54374725977414, 8.938763772344522],
          [125.53851841047147, 8.938195583969957],
          [125.53825944607968, 8.939733796875855],
          [125.5346545572776, 8.940242524788793],
          [125.53285211287657, 8.939776190895744],
        ],
      ],
    },
    properties: {
      id: 'm-001',
      zoneType: 'I-1',
      zoneName: 'Manufacturing - Pangabugan',
      description: 'Main commercial strip with retail and offices',
      address: 'Pangabugan, Butuan City',
      regulations:
        'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
      objectId: 6,
    },
  },
];

// Check for duplicate IDs
const idSet = new Set<string>();
const duplicateIds: string[] = [];

zoningAreas.forEach((area) => {
  const id = area.properties.id;
  if (idSet.has(id)) {
    duplicateIds.push(id);
  } else {
    idSet.add(id);
  }
});

if (duplicateIds.length > 0) {
  console.warn(
    'WARNING: Duplicate IDs found in zoningAreas:',
    duplicateIds
  );
}

// Helper function to parse FAR and height from regulations
export const parseRegulations = (regulations: string) => {
  const farMatch = regulations.match(/FAR:\s*([0-9.]+)/);
  const heightMatch = regulations.match(
    /Max height:\s*(\d+)\s*meters/
  );

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
      const area = zoningAreas.find(
        (a) => a.properties.zoneType === zoneType
      );
      if (!area) return null;

      const regulations = parseRegulations(
        area.properties.regulations
      );

      return {
        code: area.properties.zoneType,
        name: area.properties.zoneName.split(' - ')[0], // Remove location part
        far: regulations.far,
        height: regulations.height,
      };
    })
    .filter(
      (district): district is NonNullable<typeof district> =>
        district !== null
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

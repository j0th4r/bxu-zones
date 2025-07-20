// Azure Maps Configuration
// For security in production, use environment variables instead of hardcoding the key

export const AZURE_MAPS_CONFIG = {
  // TODO: Replace 'YOUR_SUBSCRIPTION_KEY_HERE' with your actual Azure Maps subscription key
  subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY,

  // Map settings
  defaultCenter: [125.5431274, 8.9511601], // Butuan City coordinates [longitude, latitude]
  defaultZoom: 15,
  mapStyle: 'road', // Default style

  // Available map styles
  mapStyles: {
    road: {
      style: 'road',
      name: 'Road',
      description: 'Standard road map with streets and labels',
    },
    satellite: {
      style: 'satellite',
      name: 'Satellite',
      description: 'Aerial satellite imagery',
    },
    hybrid: {
      style: 'satellite_road_labels',
      name: 'Hybrid',
      description: 'Satellite imagery with road labels',
    },
    dark: {
      style: 'grayscale_dark',
      name: 'Dark',
      description: 'Dark theme map',
    },
    night: {
      style: 'night',
      name: 'Night',
      description: 'Night mode map',
    },
  },

  // Zoning colors (matching your existing theme)
  zoningColors: {
    'R-1': {fill: '#9333ea', stroke: '#7c3aed'}, // Purple for Residential
    'C-1': {fill: '#dc2626', stroke: '#b91c1c'}, // Red for Commercial
    MU: {fill: '#ec4899', stroke: '#db2777'}, // Pink for Mixed Use
    'I-1': {fill: '#6b7280', stroke: '#4b5563'}, // Gray for Industrial
    OS: {fill: '#16a34a', stroke: '#15803d'}, // Green for Open Space
    default: {fill: '#3b82f6', stroke: '#2563eb'}, // Default blue
  },

  // Butuan City places and landmarks
  landmarks: [
    {
      name: 'Butuan National Museum',
      coordinates: [125.5431, 8.9512],
      type: 'museum',
      description: 'National museum showcasing local history and artifacts',
    },
    {
      name: 'Magsaysay Bridge',
      coordinates: [125.5425, 8.952],
      type: 'landmark',
      description: 'Major bridge connecting parts of Butuan City',
    },
    {
      name: 'Butuan City Hall',
      coordinates: [125.544, 8.9505],
      type: 'government',
      description: 'Main government building and administrative center',
    },
    {
      name: 'Gaisano Mall Butuan',
      coordinates: [125.545, 8.9515],
      type: 'shopping',
      description: 'Major shopping mall in Butuan City',
    },
    {
      name: 'Butuan Airport (Bancasi)',
      coordinates: [125.4789, 8.9511],
      type: 'airport',
      description: 'Butuan Airport serving Agusan del Norte',
    },
    {
      name: 'Agusan River',
      coordinates: [125.54, 8.955],
      type: 'river',
      description: 'Major river running through Butuan City',
    },
    {
      name: 'Butuan Central Market',
      coordinates: [125.5435, 8.95],
      type: 'market',
      description: 'Main public market for local goods and produce',
    },
    {
      name: 'Robinsons Place Butuan',
      coordinates: [125.546, 8.951],
      type: 'shopping',
      description: 'Popular shopping and entertainment complex',
    },
    {
      name: 'Father Saturnino Urios University',
      coordinates: [125.547, 8.948],
      type: 'university',
      description: 'Major private university in Butuan City',
    },
    {
      name: 'St. Joseph Cathedral',
      coordinates: [125.543, 8.9495],
      type: 'religious',
      description: 'Historic Catholic cathedral in Butuan',
    },
  ],
};

// Validation function to check if subscription key is set
export const validateAzureMapsConfig = (): boolean => {
  const {subscriptionKey} = AZURE_MAPS_CONFIG;

  if (
    !subscriptionKey ||
    subscriptionKey === import.meta.env.VITE_AZURE_MAPS_KEY
  ) {
    console.error(
      'Azure Maps subscription key not configured. Please set VITE_AZURE_MAPS_KEY environment variable or update the config file.'
    );
    return false;
  }

  return true;
};

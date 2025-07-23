

export const GOOGLE_MAPS_CONFIG = {
  // Pull the API key from Vite environment variables
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  mapStyles: {
    default: 'roadmap',
    satellite: 'hybrid',
    terrain: 'terrain'
  },
  mapLayers: {
    traffic: false,
    transit: false,
    // Terrain is now handled via mapStyles selection instead of a separate layer toggle.
    streetView: false
  },
  defaultCenter: {
    lat: 8.9475,
    lng: 125.5406
  },
  defaultZoom: 14
}; 
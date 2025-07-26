// Mapbox Configuration
export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKENS || '',
  
  // Default center coordinates for Butuan City
  defaultCenter: {
    longitude: 125.5433, // Butuan City longitude
    latitude: 8.9488,   // Butuan City latitude
  },
  
  // Default zoom level
  defaultZoom: 13,

  
  // Map style
  defaultStyle: 'mapbox://styles/mapbox/standard',
  
  // Alternative map styles
  mapStyles: {
    standard: 'mapbox://styles/mapbox/standard',
    streets: 'mapbox://styles/mapbox/streets-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  },

 

  
  // Map restrictions for Butuan City area
  maxBounds: [
    [125.0, 8.5],  // Southwest coordinates
    [126.0, 9.5]   // Northeast coordinates
  ] as [[number, number], [number, number]],
  
  // Default map options
  mapOptions: {
    minZoom: 10,
    maxZoom: 20,
    attributionControl: false,
    logoPosition: 'bottom-left' as const,
  }
};

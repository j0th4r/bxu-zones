import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon, Marker } from '@react-google-maps/api';
import { Parcel } from '../types/zoning';
import { ZoningAPI } from '../utils/api';
import { getZoneColor } from '../config/zoning-colors';
import { GOOGLE_MAPS_CONFIG } from '../config/google-maps';
import '../styles/map-cursors.css';

// Shared zoning areas dataset
import { zoningAreas as zoningData } from '../data/zoningAreas';

// Extend window type for our logging flag
declare global {
  interface Window {
    zoningAreasLogged?: boolean;
  }
}

// Butuan City center coordinates
const BUTUAN_CENTER = GOOGLE_MAPS_CONFIG.defaultCenter;

const containerStyle = {
  width: '100%',
  height: '100vh',
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

// Custom map options
const defaultMapOptions = {
  zoomControl: false,  // we provide custom zoom buttons
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  disableDefaultUI: true,
  restriction: {
    latLngBounds: {
      north: 9.5,
      south: 8.5,
      east: 126.0,
      west: 125.0,
    },
    strictBounds: false
  },
  // Disable default cursors
  draggableCursor: 'inherit',
  draggingCursor: 'inherit'
};

interface MapComponentProps {
  onParcelClick: (parcel: Parcel) => void;
  searchResults?: any;
  className?: string;
  layerVisibility?: Record<string, boolean>;
  activeMeasurementTool?: string | null;
  currentMapStyle?: string;
  centerCoordinates?: [number, number] | null;
}

export const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(({
  onParcelClick,
  searchResults,
  className = '',
  layerVisibility = {},
  currentMapStyle = GOOGLE_MAPS_CONFIG.mapStyles.default,
  centerCoordinates = null,
}, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLayers, setMapLayers] = useState(GOOGLE_MAPS_CONFIG.mapLayers);
  const [mapFullyLoaded, setMapFullyLoaded] = useState(false);
  
  // Refs for layers
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const transitLayerRef = useRef<google.maps.TransitLayer | null>(null);

  // Complete zoning areas dataset (GeoJSON Features)
  type ZoningFeature = {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][]; // [ [ [lng,lat], ... ] ]
    };
    properties: {
      id: string;
      zoneType: string;
      zoneName: string;
      description: string;
      address: string;
      regulations: string;
      objectId: number;
    };
  };

  const zoningAreas: ZoningFeature[] = zoningData as unknown as ZoningFeature[];

  // Log zoningAreas data for debugging
  useEffect(() => {
    console.log(`Loaded ${zoningData.length} zoning areas`);
  }, []);

  useEffect(() => {
    loadZoningData();
    console.log('Map component mounted');
    console.log('API Key:', GOOGLE_MAPS_CONFIG.apiKey);
  }, []);

  // Handle layer visibility changes
  useEffect(() => {
    if (!map) return;

    // Initialize layers if they haven't been created yet
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }
    if (!transitLayerRef.current) {
      transitLayerRef.current = new google.maps.TransitLayer();
    }

    const updatedLayers = { ...mapLayers };

    // Handle traffic layer
    if ('traffic' in layerVisibility) {
      updatedLayers.traffic = layerVisibility.traffic;
      trafficLayerRef.current.setMap(layerVisibility.traffic ? map : null);
    }

    // Handle transit layer
    if ('transit' in layerVisibility) {
      updatedLayers.transit = layerVisibility.transit;
      transitLayerRef.current.setMap(layerVisibility.transit ? map : null);
    }

    // Handle street view
    if ('streetView' in layerVisibility) {
      updatedLayers.streetView = layerVisibility.streetView;
      map.setOptions({ streetViewControl: layerVisibility.streetView });
    }

    setMapLayers(updatedLayers);
  }, [layerVisibility, map, currentMapStyle]);

  // Cleanup layers on unmount
  useEffect(() => {
    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
      if (transitLayerRef.current) {
        transitLayerRef.current.setMap(null);
      }
    };
  }, []);

  // Handle map style changes
  useEffect(() => {
    if (map) {
      map.setMapTypeId(currentMapStyle as google.maps.MapTypeId);
    }
  }, [currentMapStyle, map]);

  // Center map when centerCoordinates changes
  useEffect(() => {
    if (map && centerCoordinates) {
      map.panTo({ lat: centerCoordinates[1], lng: centerCoordinates[0] });
      map.setZoom(16);
    }
  }, [centerCoordinates, map]);

  // Handle search results
  useEffect(() => {
    if (searchResults?.results?.parcels) {
      // The map will automatically update markers through the render cycle
      setIsLoading(false);
    }
  }, [searchResults]);

  // Expose zoom methods to parent
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (map) {
        map.setZoom((map.getZoom() || 14) + 1);
      }
    },
    zoomOut: () => {
      if (map) {
        map.setZoom((map.getZoom() || 14) - 1);
      }
    }
  }));

  const loadZoningData = async () => {
    try {
      await ZoningAPI.getZoningDistricts();
      // Data loaded successfully (used for initial loading state)
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading zoning data:', error);
      setIsLoading(false);
    }
  };

  const onLoad = (map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(map);
    
    // Listen for the tilesloaded event to know when the map is fully rendered
    map.addListener('tilesloaded', () => {
      console.log('Map tiles loaded, map is fully rendered');
      setIsLoading(false);
      setMapFullyLoaded(true);
    });
    
    // Also set a backup timeout in case the event doesn't fire
    setTimeout(() => {
      if (!mapFullyLoaded) {
        console.log('Backup timeout: forcing map to be considered loaded');
        setIsLoading(false);
        setMapFullyLoaded(true);
      }
    }, 3000);
  };

  const onLoadError = (error: Error) => {
    console.error('Error loading Google Maps:', error);
    setIsLoading(false);
  };

  return (
    <div className={`map-container ${className}`}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_CONFIG.apiKey}
        googleMapsClientId={undefined}
        preventGoogleFontsLoading={true}
        onError={onLoadError}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={BUTUAN_CENTER}
          zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
          onLoad={onLoad}
          options={{
            mapTypeId: currentMapStyle as google.maps.MapTypeId,
            ...defaultMapOptions,
            streetViewControl: false
          }}
        >
          {/* Render zoning polygons */}
          {(() => {
            if (mapFullyLoaded && (layerVisibility['Zoning Districts'] === undefined || layerVisibility['Zoning Districts'] !== false)) {
              // Only log once when first rendering zones
              if (zoningAreas.length > 0 && !window.zoningAreasLogged) {
                console.log(`✅ Loaded ${zoningAreas.length} zoning areas for display`);
                window.zoningAreasLogged = true;
              }
              return zoningAreas.map((feature) => {
                const { id, zoneType, zoneName, description, address, objectId } = feature.properties;
                const path = feature.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
                return (
              <Polygon
                    key={`${id}-${objectId}`}
                    paths={path}
                options={{
                      fillColor: getZoneColor(zoneType),
                      fillOpacity: 0.75,
                  strokeColor: '#FFFFFF',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                }}
                onClick={() => {
                  const mockParcel: Parcel = {
                        id,
                        address,
                        zoneId: zoneType,
                    geometry: null,
                    attributes: {
                          OBJECTID: objectId,
                          ZONE_NAME: zoneName,
                          ZONE_TYPE: zoneType,
                          DESCRIPTION: description,
                          ADDRESS: address,
                    },
                  };
                  onParcelClick(mockParcel);
                }}
              />
                );
              });
            }
            return null;
          })()}

          {/* Render search result markers */}
          {searchResults?.results?.parcels?.map((parcel: Parcel, index: number) => (
            parcel.geometry && (
              <Marker
                key={`search-${index}`}
                position={{
                  lat: parcel.geometry.coordinates[1],
                  lng: parcel.geometry.coordinates[0]
                }}
                onClick={() => onParcelClick(parcel)}
              />
            )
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Traffic Legend */}
      {layerVisibility?.traffic && (
        <div className="absolute bottom-20 right-4 bg-gray-900 bg-opacity-80 text-xs text-white rounded-md shadow-lg p-2 space-y-1 z-20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Live traffic</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-block w-4 h-2 rounded-sm bg-green-500" />
            <span className="inline-block w-4 h-2 rounded-sm bg-yellow-500" />
            <span className="inline-block w-4 h-2 rounded-sm bg-orange-500" />
            <span className="inline-block w-4 h-2 rounded-sm bg-red-600" />
          </div>
          <div className="flex justify-between text-gray-300 pt-1">
            <span className="pr-2">Fast</span>
            <span>Slow</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading map data...</p>
          </div>
        </div>
      )}
    </div>
  );
});

export type MapComponentRef = {
  zoomIn: () => void;
  zoomOut: () => void;
};

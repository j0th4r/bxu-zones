import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, Polygon, Marker } from '@react-google-maps/api';
import { Parcel } from '../types/zoning';
import { ZoningAPI } from '../utils/api';
import { getZoneColor } from '../config/zoning-colors';
import { GOOGLE_MAPS_CONFIG } from '../config/google-maps';
import '../styles/map-cursors.css';
import '../styles/marker-highlight.css';

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
  isMeasurementActive?: boolean;
  onClearMeasurements?: () => void;
  currentMapStyle?: string;
  centerCoordinates?: [number, number] | null;
  highlightedMarkerParcel?: Parcel | null;
  onMapClick?: () => void; // New prop for clearing highlights
}

export const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(({
  onParcelClick,
  searchResults,
  className = '',
  layerVisibility = {},
  activeMeasurementTool = null,
  isMeasurementActive = false,
  onClearMeasurements,
  currentMapStyle = GOOGLE_MAPS_CONFIG.mapStyles.default,
  centerCoordinates = null,
  highlightedMarkerParcel = null,
  onMapClick,
}, ref) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: ['drawing'],
    preventGoogleFontsLoading: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLayers, setMapLayers] = useState(GOOGLE_MAPS_CONFIG.mapLayers);
  const [mapFullyLoaded, setMapFullyLoaded] = useState(false);
  
  // Refs for layers
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const transitLayerRef = useRef<google.maps.TransitLayer | null>(null);

  // Measurement tool state
  const [measurementListeners, setMeasurementListeners] = useState<google.maps.MapsEventListener[]>([]);
  const [measurementMarkers, setMeasurementMarkers] = useState<google.maps.Marker[]>([]);
  const [measurementPolylines, setMeasurementPolylines] = useState<google.maps.Polyline[]>([]);
  const [currentPath, setCurrentPath] = useState<google.maps.LatLng[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);

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
  // Create custom marker icons
  const createMarkerIcon = (isHighlighted: boolean = false): google.maps.Icon => {
    const size = isHighlighted ? 40 : 30;
    const strokeWidth = isHighlighted ? 3 : 2;
    const strokeColor = isHighlighted ? '#3b82f6' : '#1f2937';
    const fillColor = isHighlighted ? '#60a5fa' : '#ef4444';
    
    // Create SVG icon with enhanced glow effect for highlighted markers
    const svgIcon = `
      <svg width="${size}" height="${size}" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${isHighlighted ? `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="outerGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="outerColoredBlur"/>
              <feMerge> 
                <feMergeNode in="outerColoredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ` : ''}
        </defs>
        ${isHighlighted ? `
          <!-- Outer glow ring -->
          <circle cx="15" cy="15" r="12" 
                  fill="none" 
                  stroke="${strokeColor}" 
                  stroke-width="2"
                  opacity="0.3"
                  filter="url(#outerGlow)"
          />
        ` : ''}
        <!-- Main marker circle -->
        <circle cx="15" cy="15" r="10" 
                fill="${fillColor}" 
                stroke="${strokeColor}" 
                stroke-width="${strokeWidth}"
                ${isHighlighted ? 'filter="url(#glow)"' : ''}
        />
        <!-- Inner white dot -->
        <circle cx="15" cy="15" r="3" fill="white" />
        ${isHighlighted ? `
          <!-- Additional highlight ring -->
          <circle cx="15" cy="15" r="10" 
                  fill="none" 
                  stroke="${strokeColor}" 
                  stroke-width="1"
                  opacity="0.6"
          />
        ` : ''}
      </svg>
    `;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
  };

  // Check if a parcel is highlighted
  const isParcelHighlighted = (parcel: Parcel): boolean => {
    if (!highlightedMarkerParcel) return false;
    return highlightedMarkerParcel.id === parcel.id;
  };

  // Distance calculation using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };

  // Clear all measurement elements
  const clearMeasurements = () => {
    // Clear markers
    measurementMarkers.forEach(marker => marker.setMap(null));
    setMeasurementMarkers([]);
    
    // Clear polylines
    measurementPolylines.forEach(polyline => polyline.setMap(null));
    setMeasurementPolylines([]);
    
    // Clear listeners
    measurementListeners.forEach(listener => google.maps.event.removeListener(listener));
    setMeasurementListeners([]);
    
    // Reset state
    setCurrentPath([]);
    setTotalDistance(0);
    
    // Restore default cursor
    if (map) {
      map.setOptions({ draggableCursor: 'inherit' });
    }
  };

  // Create measurement marker with distance label
  const createMeasurementMarker = (position: google.maps.LatLng, segmentDistance?: number, totalDistance?: number, isStart: boolean = false): google.maps.Marker => {
    // Create the marker
    const marker = new google.maps.Marker({
      position,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: isStart ? '#1a73e8' : '#ffffff',
        fillOpacity: 1,
        strokeColor: '#1a73e8',
        strokeWeight: 3,
        scale: 6,
      },
      zIndex: 1000,
    });

    // Create distance label if provided
    if (segmentDistance !== undefined) {
      const labelText = segmentDistance < 1000 
        ? `${segmentDistance.toFixed(2)} m`
        : `${(segmentDistance / 1000).toFixed(2)} km`;

      const labelMarker = new google.maps.Marker({
        position,
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="25" viewBox="0 0 60 25">
              <rect x="2" y="2" width="56" height="21" fill="white" stroke="#1a73e8" stroke-width="1" rx="3"/>
              <text x="30" y="16" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-size="11" font-weight="500" fill="#1a73e8">${labelText}</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(60, 25),
          anchor: new google.maps.Point(30, 30),
        },
        zIndex: 999,
      });
      
      setMeasurementMarkers(prev => [...prev, labelMarker]);
    }

    return marker;
  };

  // Create polyline between two points
  const createMeasurementPolyline = (start: google.maps.LatLng, end: google.maps.LatLng): google.maps.Polyline => {
    return new google.maps.Polyline({
      path: [start, end],
      geodesic: true,
      strokeColor: '#1a73e8',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map,
      zIndex: 100,
    });
  };

  // Start measuring distance
  const startMeasurement = () => {
    if (!map) return;
    
    clearMeasurements();
    
    // Change cursor to crosshair
    map.setOptions({ draggableCursor: 'crosshair' });
    
    const clickListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      
      const newPath = [...currentPath, event.latLng];
      setCurrentPath(newPath);
      
      if (newPath.length === 1) {
        // First point - create start marker
        const startMarker = createMeasurementMarker(event.latLng, undefined, undefined, true);
        setMeasurementMarkers(prev => [...prev, startMarker]);
      } else {
        // Subsequent points
        const prevPoint = newPath[newPath.length - 2];
        const segmentDistance = calculateDistance(
          prevPoint.lat(),
          prevPoint.lng(),
          event.latLng.lat(),
          event.latLng.lng()
        );
        
        const newTotal = totalDistance + segmentDistance;
        setTotalDistance(newTotal);
        
        // Create measurement point marker with segment distance
        const marker = createMeasurementMarker(event.latLng, segmentDistance, newTotal);
        setMeasurementMarkers(prev => [...prev, marker]);
        
        // Create polyline between previous and current point
        const polyline = createMeasurementPolyline(prevPoint, event.latLng);
        setMeasurementPolylines(prev => [...prev, polyline]);
      }
    });

    const dblClickListener = map.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      // Finish measurement - restore cursor
      map.setOptions({ draggableCursor: 'inherit' });
      
      // Remove listeners
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(dblClickListener);
      setMeasurementListeners(prev => prev.filter(l => l !== clickListener && l !== dblClickListener));
      
      // If we have at least 2 points, close the path if it's a polygon-like measurement
      if (currentPath.length >= 3 && event.latLng) {
        const firstPoint = currentPath[0];
        const lastPoint = event.latLng;
        
        // Check if the last click is close to the first point (within 10 pixels)
        const pixel1 = map.getProjection()?.fromLatLngToPoint(firstPoint);
        const pixel2 = map.getProjection()?.fromLatLngToPoint(lastPoint);
        
        if (pixel1 && pixel2) {
          const zoom = map.getZoom() || 1;
          const scale = Math.pow(2, zoom);
          const distance = Math.sqrt(
            Math.pow((pixel1.x - pixel2.x) * scale, 2) + 
            Math.pow((pixel1.y - pixel2.y) * scale, 2)
          );
          
          if (distance < 10) {
            // Close the polygon
            const closingDistance = calculateDistance(
              lastPoint.lat(),
              lastPoint.lng(),
              firstPoint.lat(),
              firstPoint.lng()
            );
            
            const closingPolyline = createMeasurementPolyline(lastPoint, firstPoint);
            setMeasurementPolylines(prev => [...prev, closingPolyline]);
            
            // Add closing distance marker at midpoint
            const midLat = (lastPoint.lat() + firstPoint.lat()) / 2;
            const midLng = (lastPoint.lng() + firstPoint.lng()) / 2;
            const midPoint = new google.maps.LatLng(midLat, midLng);
            
            const closingMarker = createMeasurementMarker(midPoint, closingDistance);
            setMeasurementMarkers(prev => [...prev, closingMarker]);
          }
        }
      }
    });

    setMeasurementListeners([clickListener, dblClickListener]);
  };

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
      console.log(`🔍 Search results updated: ${searchResults.results.parcels.length} parcels found`);
      // The map will automatically update markers through the render cycle
      setIsLoading(false);
    }
  }, [searchResults]);

  // Log when map is fully loaded for debugging
  useEffect(() => {
    if (mapFullyLoaded) {
      console.log('📍 Google Maps fully loaded, markers should be visible');
      if (searchResults?.results?.parcels) {
        console.log(`📍 ${searchResults.results.parcels.length} search result markers should be rendered`);
      }
    }
  }, [mapFullyLoaded, searchResults]);

  // Handle measurement tool activation
  useEffect(() => {
    if (!map) return;
    
    if (activeMeasurementTool === 'distance' && isMeasurementActive) {
      console.log('📏 Activating distance measurement tool');
      startMeasurement();
    } else {
      // Clear any active measurement listeners when tool is deactivated
      measurementListeners.forEach(listener => google.maps.event.removeListener(listener));
      setMeasurementListeners([]);
      setCurrentPath([]);
      setTotalDistance(0);
      
      // Restore default cursor
      if (map) {
        map.setOptions({ draggableCursor: 'inherit' });
      }
    }
  }, [activeMeasurementTool, isMeasurementActive, map]);

  // Cleanup measurements on unmount
  useEffect(() => {
    return () => {
      clearMeasurements();
    };
  }, []);

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
    },
    clearMeasurements: () => {
      clearMeasurements();
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
      
      // Force a re-render of markers if we have search results
      if (searchResults?.results?.parcels) {
        console.log('🔄 Forcing marker re-render after tiles loaded');
        // Small delay to ensure map is ready
        setTimeout(() => {
          setMapFullyLoaded(false);
          setMapFullyLoaded(true);
        }, 100);
      }
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

  if (loadError) {
    return <div className={`map-container ${className}`}>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className={`map-container ${className}`}>Loading Google Maps...</div>;
  }

  return (
    <div className={`map-container ${className}`}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={BUTUAN_CENTER}
          zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
          onLoad={onLoad}
          onClick={onMapClick} // Clear highlights when clicking on empty map
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
          {mapFullyLoaded && searchResults?.results?.parcels?.map((parcel: Parcel, index: number) => {
            if (!parcel.geometry) return null;
            
            return (
              <Marker
                key={`search-${parcel.id}-${index}`}
                position={{
                  lat: parcel.geometry.coordinates[1],
                  lng: parcel.geometry.coordinates[0]
                }}
                onClick={() => onParcelClick(parcel)}
                icon={createMarkerIcon(isParcelHighlighted(parcel))}
                zIndex={isParcelHighlighted(parcel) ? 1000 : 100}
              />
            );
          })}
        </GoogleMap>

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
  clearMeasurements: () => void;
};

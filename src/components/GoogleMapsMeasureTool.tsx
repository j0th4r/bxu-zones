import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useGoogleMeasurement } from '../hooks/useGoogleMeasurement';
import { calculateHaversineDistance, formatDistance, calculatePathDistance } from '../services/measurement-service';

interface GoogleMapsMeasureToolProps {
  map: google.maps.Map;
  isActive: boolean;
  measurementType: 'distance' | 'area';
  onStop: () => void;
}

interface AreaPoint {
  id: string;
  position: google.maps.LatLng;
  marker?: google.maps.Marker;
}

export const GoogleMapsMeasureTool: React.FC<GoogleMapsMeasureToolProps> = ({
  map,
  isActive,
  measurementType,
  onStop
}) => {
  // Use the distance measurement hook
  const distanceMeasurement = useGoogleMeasurement(map);
  
  // Area measurement state
  const [areaPoints, setAreaPoints] = useState<AreaPoint[]>([]);
  const [isAreaMeasuring, setIsAreaMeasuring] = useState(false);
  const [totalArea, setTotalArea] = useState(0);
  const [areaPolygon, setAreaPolygon] = useState<google.maps.Polygon | null>(null);
  const areaMarkersRef = useRef<google.maps.Marker[]>([]);
  const areaClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  
  // Enhanced state for closed polygon detection
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);
  const [polygonPerimeter, setPolygonPerimeter] = useState(0);
  const [closedPolygonArea, setClosedPolygonArea] = useState(0);

  // Distance threshold for detecting clicks near the first point (in meters)
  const CLOSURE_THRESHOLD = 50;

  // Check if a click is near the first point
  const isNearFirstPoint = useCallback((clickPosition: google.maps.LatLng, firstPoint: google.maps.LatLng): boolean => {
    const distance = calculateHaversineDistance(
      clickPosition.lat(),
      clickPosition.lng(),
      firstPoint.lat(),
      firstPoint.lng()
    );
    return distance <= CLOSURE_THRESHOLD;
  }, []);

  // Calculate polygon perimeter (including closing segment)
  const calculatePolygonPerimeter = useCallback((points: google.maps.LatLng[], closed: boolean = true): number => {
    if (points.length < 2) return 0;
    
    const coordinates: [number, number][] = points.map(point => [
      point.lat(),
      point.lng()
    ]);
    
    // Calculate path distance
    let totalDistance = calculatePathDistance(coordinates);
    
    // Add closing segment if polygon should be closed
    if (closed && points.length >= 3) {
      const lastPoint = points[points.length - 1];
      const firstPoint = points[0];
      const closingDistance = calculateHaversineDistance(
        lastPoint.lat(),
        lastPoint.lng(),
        firstPoint.lat(),
        firstPoint.lng()
      );
      totalDistance += closingDistance;
    }
    
    return totalDistance;
  }, []);

  // Calculate polygon area using the shoelace formula
  const calculatePolygonArea = useCallback((points: google.maps.LatLng[]): number => {
    if (points.length < 3) return 0;
    
    // Convert to radians and calculate area using spherical excess
    const earthRadius = 6371000; // Earth radius in meters
    let area = 0;
    
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const xi = points[i].lng() * Math.PI / 180;
      const yi = points[i].lat() * Math.PI / 180;
      const xj = points[j].lng() * Math.PI / 180;
      const yj = points[j].lat() * Math.PI / 180;
      
      area += xi * Math.sin(yj) - xj * Math.sin(yi);
    }
    
    return Math.abs(area * earthRadius * earthRadius / 2);
  }, []);

  // Enhanced area click handler with polygon closure detection
  const handleAreaClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isAreaMeasuring || !e.latLng) return;
    
    setAreaPoints(prevPoints => {
      // Check if clicking near the first point to close polygon
      if (prevPoints.length >= 3 && isNearFirstPoint(e.latLng!, prevPoints[0].position)) {
        // Close the polygon
        const positions = prevPoints.map(p => p.position);
        const area = calculatePolygonArea(positions);
        const perimeter = calculatePolygonPerimeter(positions, true); // Explicitly close the polygon
        
        setClosedPolygonArea(area);
        setPolygonPerimeter(perimeter);
        setIsPolygonClosed(true);
        
        // Update polygon to be closed
        if (areaPolygon) {
          areaPolygon.setPath(positions);
          areaPolygon.setOptions({
            strokeColor: '#059669', // Darker green when closed
            fillOpacity: 0.3
          });
        }
        
        // Remove click listener since polygon is complete
        if (areaClickListenerRef.current) {
          google.maps.event.removeListener(areaClickListenerRef.current);
          areaClickListenerRef.current = null;
        }
        
        // Reset cursor
        map.setOptions({ draggableCursor: 'inherit' });
        
        return prevPoints; // Don't add the closing point as a separate point
      }
      
      // Regular point addition
      const pointId = `area-point-${Date.now()}`;
      const marker = new google.maps.Marker({
        position: e.latLng!,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      
      areaMarkersRef.current.push(marker);
      
      const newPoint = {
        id: pointId,
        position: e.latLng!,
        marker
      };
      
      const newPoints = [...prevPoints, newPoint];
      
      // Update polygon if we have at least 3 points
      if (newPoints.length >= 3) {
        const positions = newPoints.map(p => p.position);
        const area = calculatePolygonArea(positions);
        setTotalArea(area);
        
        if (areaPolygon) {
          areaPolygon.setPath(positions);
        } else {
          const polygon = new google.maps.Polygon({
            paths: positions,
            strokeColor: '#10b981',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#10b981',
            fillOpacity: 0.2,
            map: map
          });
          setAreaPolygon(polygon);
        }
      }
      
      return newPoints;
    });
  }, [isAreaMeasuring, map, calculatePolygonArea, calculatePolygonPerimeter, areaPolygon, isNearFirstPoint]);

  // Enhanced area click handler for distance measurement with closure detection
  const handleDistanceClickWithClosure = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    // Check if we should close the polygon
    if (distanceMeasurement.points.length >= 3 && isNearFirstPoint(e.latLng, distanceMeasurement.points[0].position)) {
      // Close the polygon and calculate both measurements
      const positions = distanceMeasurement.points.map(p => p.position);
      const area = calculatePolygonArea(positions);
      const perimeter = calculatePolygonPerimeter(positions, true); // Explicitly close the polygon
      
      console.log('Closing polygon with perimeter:', perimeter, 'area:', area); // Debug log
      
      setClosedPolygonArea(area);
      setPolygonPerimeter(perimeter);
      setIsPolygonClosed(true);
      
      // Create a closed polygon overlay
      const polygon = new google.maps.Polygon({
        paths: positions,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        map: map
      });
      setAreaPolygon(polygon);
      
      // Stop measurement mode AFTER we've captured all the data
      setTimeout(() => {
        distanceMeasurement.clearMeasurement();
      }, 100);
      
      // Prevent the event from continuing to the normal measurement handler
      e.stop?.();
      return;
    }
    
    // If not closing, let the normal measurement proceed
    // The useGoogleMeasurement hook will handle this automatically
  }, [distanceMeasurement, isNearFirstPoint, calculatePolygonArea, calculatePolygonPerimeter, map]);

  // Start area measurement
  const startAreaMeasurement = useCallback(() => {
    setIsAreaMeasuring(true);
    setAreaPoints([]);
    setTotalArea(0);
    setIsPolygonClosed(false);
    setPolygonPerimeter(0);
    setClosedPolygonArea(0);
    areaMarkersRef.current = [];
    
    map.setOptions({ draggableCursor: 'crosshair' });
    
    // Add click listener
    areaClickListenerRef.current = map.addListener('click', handleAreaClick);
  }, [map, handleAreaClick]);

  // Clear area measurement
  const clearAreaMeasurement = useCallback(() => {
    // Remove click listener
    if (areaClickListenerRef.current) {
      google.maps.event.removeListener(areaClickListenerRef.current);
      areaClickListenerRef.current = null;
    }
    
    // Remove polygon
    if (areaPolygon) {
      areaPolygon.setMap(null);
      setAreaPolygon(null);
    }
    
    // Remove markers
    areaMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    areaMarkersRef.current = [];
    
    // Reset state
    setIsAreaMeasuring(false);
    setAreaPoints([]);
    setTotalArea(0);
    setIsPolygonClosed(false);
    setPolygonPerimeter(0);
    setClosedPolygonArea(0);
    
    // Reset cursor
    map.setOptions({ draggableCursor: 'inherit' });
  }, [map, areaPolygon]);

  // Clear all measurements including closed polygon
  const clearAllMeasurements = useCallback(() => {
    clearAreaMeasurement();
    distanceMeasurement.clearMeasurement();
    setIsPolygonClosed(false);
    setPolygonPerimeter(0);
    setClosedPolygonArea(0);
  }, [clearAreaMeasurement, distanceMeasurement]);

  // Effect to handle measurement type changes
  useEffect(() => {
    if (!isActive) {
      // Clean up both measurement types when not active
      if (distanceMeasurement.isMeasuring) {
        distanceMeasurement.clearMeasurement();
      }
      clearAreaMeasurement();
      setIsPolygonClosed(false);
      return;
    }

    if (measurementType === 'distance') {
      // Clear area measurement and start distance measurement
      clearAreaMeasurement();
      if (!distanceMeasurement.isMeasuring && !isPolygonClosed) {
        distanceMeasurement.toggleMeasurement();
      }
    } else if (measurementType === 'area') {
      // Clear distance measurement and start area measurement
      if (distanceMeasurement.isMeasuring) {
        distanceMeasurement.clearMeasurement();
      }
      if (!isAreaMeasuring && !isPolygonClosed) {
        startAreaMeasurement();
      }
    }
  }, [isActive, measurementType, distanceMeasurement, isAreaMeasuring, clearAreaMeasurement, startAreaMeasurement, isPolygonClosed]);

  // Add enhanced click handling for distance measurement
  useEffect(() => {
    if (measurementType === 'distance' && distanceMeasurement.isMeasuring && !isPolygonClosed) {
      const clickListener = map.addListener('click', handleDistanceClickWithClosure);
      
      return () => {
        google.maps.event.removeListener(clickListener);
      };
    }
  }, [measurementType, distanceMeasurement.isMeasuring, isPolygonClosed, map, handleDistanceClickWithClosure]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAreaMeasurement();
      if (distanceMeasurement.isMeasuring) {
        distanceMeasurement.clearMeasurement();
      }
    };
  }, [clearAreaMeasurement, distanceMeasurement]);

  // Format area for display with both units
  const formatArea = useCallback((areaInSquareMeters: number): string => {
    const areaInSqFt = areaInSquareMeters * 10.7639; // Convert m² to ft²
    
    if (areaInSquareMeters >= 10000) {
      // Display in hectares if 10,000 square meters or more
      const areaInHectares = areaInSquareMeters / 10000;
      const areaInAcres = areaInHectares * 2.47105; // Convert hectares to acres
      return `${areaInHectares.toFixed(2)} ha (${areaInAcres.toFixed(2)} acres)`;
    } else {
      return `${areaInSquareMeters.toFixed(2)} m² (${areaInSqFt.toFixed(2)} ft²)`;
    }
  }, []);

  // Format distance for display with both units
  const formatDistanceDisplay = useCallback((distanceInMeters: number): string => {
    const distanceInFeet = distanceInMeters * 3.28084; // Convert meters to feet
    
    if (distanceInMeters >= 1000) {
      const distanceInKm = distanceInMeters / 1000;
      const distanceInMiles = distanceInKm * 0.621371;
      return `${distanceInKm.toFixed(2)} km (${distanceInMiles.toFixed(2)} mi)`;
    } else {
      return `${distanceInMeters.toFixed(2)} m (${distanceInFeet.toFixed(2)} ft)`;
    }
  }, []);

  // This component renders the measurement UI
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      {isActive && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              {isPolygonClosed ? 'Closed Polygon Measurement' : 
               measurementType === 'distance' ? 'Distance Measurement' : 'Area Measurement'}
            </h3>
            <button
              onClick={onStop}
              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
            >
              Stop
            </button>
          </div>
          
          {isPolygonClosed && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300">
                <div className="mb-2">
                  <span className="text-gray-400">Total area:</span>{' '}
                  <span className="text-white font-semibold">{formatArea(closedPolygonArea)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total distance:</span>{' '}
                  <span className="text-white font-semibold">{formatDistanceDisplay(polygonPerimeter)}</span>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={clearAllMeasurements}
                  className="text-xs bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    // Toggle between showing different unit preferences
                    window.location.reload(); // Simple refresh for now
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
          
          {!isPolygonClosed && measurementType === 'distance' && (
            <div className="space-y-1">
              <div className="text-xs text-gray-300">
                Total Distance: <span className="text-blue-400 font-mono">{distanceMeasurement.formattedDistance}</span>
              </div>
              <div className="text-xs text-gray-400">
                Click to add points • Click near first point to close polygon
              </div>
              <div className="flex gap-2 mt-2">
                {distanceMeasurement.points.length > 0 && (
                  <button
                    onClick={distanceMeasurement.clearMeasurement}
                    className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={distanceMeasurement.toggleUnits}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                >
                  {distanceMeasurement.useMetric ? 'Switch to Imperial' : 'Switch to Metric'}
                </button>
              </div>
            </div>
          )}
          
          {!isPolygonClosed && measurementType === 'area' && (
            <div className="space-y-1">
              <div className="text-xs text-gray-300">
                Total Area: <span className="text-green-400 font-mono">{formatArea(totalArea)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Click to add points • Click near first point to close polygon
              </div>
              {areaPoints.length > 0 && (
                <button
                  onClick={clearAreaMeasurement}
                  className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleMapsMeasureTool;

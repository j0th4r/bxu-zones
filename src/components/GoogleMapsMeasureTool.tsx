import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useGoogleMeasurement } from '../hooks/useGoogleMeasurement';
import { calculateHaversineDistance, formatDistance, calculatePathDistance } from '../services/measurement-service';

interface GoogleMapsMeasureToolProps {
  map: google.maps.Map;
  isActive: boolean;
  measurementType: 'distance' | 'area'; // Keep for compatibility, but will always use distance
  onStop: () => void;
}

export const GoogleMapsMeasureTool: React.FC<GoogleMapsMeasureToolProps> = ({
  map,
  isActive,
  measurementType,
  onStop
}) => {
  // Use the distance measurement hook - this handles all measurement logic
  const distanceMeasurement = useGoogleMeasurement(map);
  
  // State for displaying polygon closure results
  const [polygonResults, setPolygonResults] = useState<{
    isPolygonClosed: boolean;
    polygonPerimeter: number;
    closedPolygonArea: number;
  }>({
    isPolygonClosed: false,
    polygonPerimeter: 0,
    closedPolygonArea: 0
  });

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

  const calculatePolygonPerimeter = useCallback((points: google.maps.LatLng[]): number => {
    if (points.length < 2) return 0;

    const coordinates: [number, number][] = points.map(pt => [pt.lat(), pt.lng()]);

    // Path distance without closing segment
    let distanceMeters = calculatePathDistance(coordinates);

    // Add closing segment
    const last = points[points.length - 1];
    const first = points[0];
    distanceMeters += calculateHaversineDistance(last.lat(), last.lng(), first.lat(), first.lng());

    return distanceMeters;
  }, []);

  // Listen for polygon closure from the hook
  useEffect(() => {
    // Check if polygon was closed (indicated by the hook having points but not measuring)
    if (!distanceMeasurement.isMeasuring && distanceMeasurement.points.length >= 3) {
      const positions = distanceMeasurement.points.map(p => p.position);
      const area = calculatePolygonArea(positions);
      const perimeter = calculatePolygonPerimeter(positions);
      
      setPolygonResults({
        isPolygonClosed: true,
        polygonPerimeter: perimeter,
        closedPolygonArea: area
      });
    } else if (distanceMeasurement.isMeasuring || distanceMeasurement.points.length === 0) {
      // Reset polygon results when starting new measurement or clearing
      setPolygonResults({
        isPolygonClosed: false,
        polygonPerimeter: 0,
        closedPolygonArea: 0
      });
    }
  }, [distanceMeasurement.isMeasuring, distanceMeasurement.points.length, calculatePolygonArea, calculatePolygonPerimeter]);

  // Clear all measurements
  const clearAllMeasurements = useCallback(() => {
    distanceMeasurement.clearMeasurement();
    setPolygonResults({
      isPolygonClosed: false,
      polygonPerimeter: 0,
      closedPolygonArea: 0
    });
  }, [distanceMeasurement]);

  // Effect to handle measurement activation
  useEffect(() => {
    if (!isActive) {
      // Clean up measurement when not active
      if (distanceMeasurement.isMeasuring) {
        distanceMeasurement.clearMeasurement();
      }
      clearAllMeasurements();
      return;
    }

    // Start a fresh measurement only if the tool is inactive AND no points exist yet
    if (!distanceMeasurement.isMeasuring && !polygonResults.isPolygonClosed && distanceMeasurement.points.length === 0) {
      distanceMeasurement.toggleMeasurement();
    }
  }, [isActive, distanceMeasurement, polygonResults.isPolygonClosed, clearAllMeasurements]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllMeasurements();
    };
  }, [clearAllMeasurements]);

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
              {polygonResults.isPolygonClosed ? 'Polygon Measurement Complete' : 'Measurement Tool'}
            </h3>
            <button
              onClick={onStop}
              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
            >
              Stop
            </button>
          </div>
          
          {polygonResults.isPolygonClosed && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300">
                <div className="mb-2">
                  <span className="text-gray-400">Total area:</span>{' '}
                  <span className="text-white font-semibold">{formatArea(polygonResults.closedPolygonArea)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total perimeter:</span>{' '}
                  <span className="text-white font-semibold">{formatDistanceDisplay(polygonResults.polygonPerimeter)}</span>
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
                    clearAllMeasurements();
                    distanceMeasurement.toggleMeasurement();
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                >
                  New Measurement
                </button>
              </div>
            </div>
          )}
          
          {!polygonResults.isPolygonClosed && (
            <div className="space-y-1">
              <div className="text-xs text-gray-300">
                Total Distance: <span className="text-blue-400 font-mono">{distanceMeasurement.formattedDistance}</span>
              </div>
              <div className="text-xs text-gray-400">
                {distanceMeasurement.points.length >= 3 ? 
                  'Click near the green starting point to close polygon and calculate area' :
                  'Click to add points • Need 3+ points to close polygon'}
              </div>
              <div className="flex gap-2 mt-2">
                {distanceMeasurement.points.length > 0 && (
                  <button
                    onClick={clearAllMeasurements}
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
        </>
      )}
    </div>
  );
};

export default GoogleMapsMeasureTool;

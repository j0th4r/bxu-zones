/**
 * useGoogleMeasurement.ts
 * A custom hook to handle measurement functionality specifically for Google Maps
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { calculateHaversineDistance, formatDistance } from '../services/measurement-service';

// Define map point type
type MapPoint = {
  id: string;
  position: google.maps.LatLng;
  marker?: google.maps.Marker;
};

// Define hook return type
interface UseGoogleMeasurementReturn {
  isMeasuring: boolean;
  totalDistance: number;
  formattedDistance: string;
  points: MapPoint[];
  toggleMeasurement: () => void;
  clearMeasurement: () => void;
  toggleUnits: () => void;
  useMetric: boolean;
}

/**
 * Custom hook for handling distance measurements on a Google map
 * @param mapInstance - The Google map instance
 * @returns Measurement state and functions
 */
export const useGoogleMeasurement = (mapInstance: google.maps.Map | null): UseGoogleMeasurementReturn => {
  // State to track if measurement mode is active
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  
  // State to track measurement points
  const [points, setPoints] = useState<MapPoint[]>([]);
  
  // Total distance in meters
  const [totalDistance, setTotalDistance] = useState<number>(0);
  
  // Use metric by default, can be toggled
  const [useMetric, setUseMetric] = useState<boolean>(true);

  // Reference to polyline
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  
  // Reference to all markers for cleanup
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // Reference to click listener
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  /**
   * Format the current total distance for display
   */
  const formattedDistance = formatDistance(totalDistance, !useMetric);

  /**
   * Toggle measurement mode on/off
   */
  const toggleMeasurement = useCallback(() => {
    if (isMeasuring) {
      // If currently measuring, stop and clean up
      clearMeasurement();
    } else {
      // Start measuring
      setIsMeasuring(true);
      setPoints([]);
      setTotalDistance(0);
      
      // Clear any existing markers
      markersRef.current = [];
      
      // Initialize the polyline
      if (mapInstance) {
        const polyline = new google.maps.Polyline({
          path: [],
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: mapInstance,
        });
        
        polylineRef.current = polyline;
        
        // Set cursor to crosshair (using custom cursor class)
        mapInstance.setOptions({ draggableCursor: 'crosshair' });
      }
    }
  }, [isMeasuring, mapInstance]);

  /**
   * Handle map click when in measuring mode
   */
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isMeasuring || !mapInstance || !e.latLng) return;
    
    // Create a unique ID for this point
    const pointId = `point-${Date.now()}`;
    
    setPoints(prevPoints => {
      // Create a marker for this point
      const marker = new google.maps.Marker({
        position: e.latLng!,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      
      // Store marker in ref for cleanup
      markersRef.current.push(marker);
      
      // Calculate new segment distance if this isn't the first point
      if (prevPoints.length > 0) {
        const prevPoint = prevPoints[prevPoints.length - 1];
        const segmentDistance = calculateHaversineDistance(
          prevPoint.position.lat(), prevPoint.position.lng(),
          e.latLng!.lat(), e.latLng!.lng()
        );
        
        setTotalDistance(prev => prev + segmentDistance);
      }
      
      // Create new points array with the new point
      const newPoint = {
        id: pointId,
        position: e.latLng!,
        marker
      };
      const newPoints = [...prevPoints, newPoint];
      
      // Update the polyline
      updatePolyline(newPoints);
      
      return newPoints;
    });
  }, [isMeasuring, mapInstance]);

  /**
   * Update the polyline visualization
   */
  const updatePolyline = useCallback((currentPoints: MapPoint[]) => {
    if (!polylineRef.current) return;
    
    // Get just the positions for the polyline path
    const path = currentPoints.map(point => point.position);
    
    // Update the polyline
    polylineRef.current.setPath(path);
  }, []);

  /**
   * Clear all measurement data and exit measurement mode
   */
  const clearMeasurement = useCallback(() => {
    // Remove click listener
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    
    // Remove the polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    
    // Remove all markers using the markers ref
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = []; // Clear the markers array
    
    // Reset state
    setIsMeasuring(false);
    setPoints([]);
    setTotalDistance(0);
    
    // Reset cursor
    if (mapInstance) {
      mapInstance.setOptions({ draggableCursor: 'inherit' });
    }
  }, [mapInstance]);

  /**
   * Toggle between metric and imperial units
   */
  const toggleUnits = useCallback(() => {
    setUseMetric(prev => !prev);
  }, []);

  /**
   * Setup and teardown map event listeners
   */
  useEffect(() => {
    if (!mapInstance) return;
    
    if (isMeasuring && !clickListenerRef.current) {
      // Add click handler
      clickListenerRef.current = mapInstance.addListener('click', handleMapClick);
    } else if (!isMeasuring && clickListenerRef.current) {
      // Remove click handler
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    
    // Cleanup on unmount or when measuring state changes
    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [mapInstance, isMeasuring, handleMapClick]);

  return {
    isMeasuring,
    totalDistance,
    formattedDistance,
    points,
    toggleMeasurement,
    clearMeasurement,
    toggleUnits,
    useMetric
  };
};

export default useGoogleMeasurement;

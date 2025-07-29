/**
 * useGoogleMeasurement.ts
 * A custom hook to handle measurement functionality specifically for Google Maps
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { calculateHaversineDistance, formatDistance, calculateSegmentDistances, formatRulerDistance } from '../services/measurement-service';

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
  completedMeasurement: number | null;
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
  
  // State to track completed measurements (final distance after polygon closure)
  const [completedMeasurement, setCompletedMeasurement] = useState<number | null>(null);
  
  // Use metric by default, can be toggled
  const [useMetric, setUseMetric] = useState<boolean>(true);

  // Reference to polyline
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  
  // Reference to polygon (for closed shapes)
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  
  // Reference to all markers for cleanup
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // Reference to distance labels for cleanup
  const labelsRef = useRef<google.maps.Marker[]>([]);
  
  // Reference to click listener
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  
  // Reference to zoom listener
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  
  // Reference to mouse move listener
  const mouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  
  // Reference to current zoom level
  const currentZoomRef = useRef<number>(14);

  /**
   * Format the current total distance for display
   * Uses completedMeasurement if available, otherwise uses totalDistance
   */
  const formattedDistance = formatDistance(
    completedMeasurement !== null ? completedMeasurement : totalDistance,
    !useMetric
  );

  /**
   * Get optimal font size based on zoom level
   */
  const getOptimalFontSize = useCallback((zoom: number): string => {
    if (zoom >= 18) return '14px';
    if (zoom >= 16) return '12px';
    if (zoom >= 14) return '11px';
    if (zoom >= 12) return '10px';
    return '9px';
  }, []);

  /**
   * Determine if labels should be shown based on zoom level and point density
   */
  const shouldShowLabel = useCallback((segmentIndex: number, totalSegments: number, zoom: number): boolean => {
    // Always show the last label (total distance)
    if (segmentIndex === totalSegments - 1) return true;
    
    // Show more labels at higher zoom levels
    if (zoom >= 16) return true; // Show all labels when zoomed in
    if (zoom >= 14) return segmentIndex % 2 === 0; // Show every other label
    if (zoom >= 12) return segmentIndex % 3 === 0; // Show every third label
    return segmentIndex % 4 === 0; // Show every fourth label when zoomed out
  }, []);

  /**
   * Update all labels with current zoom-appropriate styling
   */
  const updateLabelsForZoom = useCallback(() => {
    if (!mapInstance) return;
    
    const currentZoom = mapInstance.getZoom() || 14;
    currentZoomRef.current = currentZoom;
    
    const fontSize = getOptimalFontSize(currentZoom);
    
    // Update existing labels
    labelsRef.current.forEach((label, index) => {
      const shouldShow = shouldShowLabel(index, labelsRef.current.length, currentZoom);
      
      if (shouldShow) {
        const currentLabel = label.getLabel();
        label.setOptions({
          label: {
            text: (currentLabel && typeof currentLabel === 'object' && 'text' in currentLabel) ? currentLabel.text : '',
            color: '#1f2937',
            fontSize: fontSize,
            fontWeight: 'bold'
          }
        });
        label.setVisible(true);
      } else {
        label.setVisible(false);
      }
    });
  }, [mapInstance, getOptimalFontSize, shouldShowLabel]);

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
      
      // Clear any existing markers and labels
      markersRef.current = [];
      labelsRef.current = [];
      
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
        
        // Set cursor to crosshair
        mapInstance.setOptions({ draggableCursor: 'crosshair' });
        
        // Add zoom listener for dynamic label adjustment
        if (!zoomListenerRef.current) {
          zoomListenerRef.current = mapInstance.addListener('zoom_changed', updateLabelsForZoom);
        }
      }
    }
  }, [isMeasuring, mapInstance, updateLabelsForZoom]);

  /**
   * Check if click is near an existing point (for polygon closure)
   */
  const isNearPoint = useCallback((clickPos: google.maps.LatLng, existingPos: google.maps.LatLng, threshold: number = 75): boolean => {
    if (!mapInstance) return false;
    
    // Calculate distance in meters using Haversine formula
    const distanceMeters = calculateHaversineDistance(
      clickPos.lat(),
      clickPos.lng(),
      existingPos.lat(),
      existingPos.lng()
    );
    
    return distanceMeters < threshold;
  }, [mapInstance]);

  /**
   * Create closed polygon when shape is completed
   */
  const createClosedPolygon = useCallback((pointPositions: google.maps.LatLng[]) => {
    if (!mapInstance || pointPositions.length < 3) return;

    // Remove the existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Create a filled polygon
    const polygon = new google.maps.Polygon({
      paths: pointPositions,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      map: mapInstance
    });

    polygonRef.current = polygon;
  }, [mapInstance]);

  /**
   * Handle map click when in measuring mode
   */
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isMeasuring || !mapInstance || !e.latLng) return;
    
    setPoints(prevPoints => {
      // Check if we have at least 3 points and clicked near the first point (polygon closure)
      if (prevPoints.length >= 3 && isNearPoint(e.latLng!, prevPoints[0].position)) {
        closePolygon(prevPoints);
        return prevPoints; // Don't add a new point, just close the polygon
      }
      
      console.log(`📍 Adding point ${prevPoints.length + 1}. Need ${Math.max(0, 3 - prevPoints.length)} more points to enable polygon closure.`);
      
      // Regular point addition
      const pointId = `point-${Date.now()}`;
      
      // Create a marker for this point
      const isFirstPoint = prevPoints.length === 0;
      const marker = new google.maps.Marker({
        position: e.latLng!,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isFirstPoint ? 10 : 5,
          fillColor: isFirstPoint ? '#22c55e' : '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isFirstPoint ? 4 : 2,
        },
        title: isFirstPoint ? 'Starting point - click near here to close polygon' : `Point ${prevPoints.length + 1}`,
        zIndex: isFirstPoint ? 1000 : 100
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
        
        // Don't increment the distance here - we'll calculate the total in updatePolyline
        console.log(`Added new segment: ${segmentDistance.toFixed(2)}m`);
      }
      
      // Create new points array with the new point
      const newPoint = {
        id: pointId,
        position: e.latLng!,
        marker
      };
      const newPoints = [...prevPoints, newPoint];
      
      // Update the polyline and recalculate total distance
      updatePolyline(newPoints);
      
      return newPoints;
    });
  }, [isMeasuring, mapInstance, isNearPoint]);

  /**
   * Update the polyline visualization and recalculate total distance
   */
  const updatePolyline = useCallback((currentPoints: MapPoint[]) => {
    if (!polylineRef.current || !mapInstance) return;
    
    // Get just the positions for the polyline path
    const path = currentPoints.map(point => point.position);
    
    // Update the polyline
    polylineRef.current.setPath(path);
    
    // Calculate the total distance from all segments
    if (currentPoints.length >= 2) {
      let totalDist = 0;
      
      console.log("Calculating total distance from segments:");
      // Calculate each segment and add to total
      for (let i = 1; i < currentPoints.length; i++) {
        const segDist = calculateHaversineDistance(
          currentPoints[i-1].position.lat(), currentPoints[i-1].position.lng(),
          currentPoints[i].position.lat(), currentPoints[i].position.lng()
        );
        
        // Store previous total before adding current segment
        const previousTotal = totalDist;
        totalDist += segDist;
        
        // Log with the format the user requested
        if (i === 1) {
          console.log(`  Segment ${i}: ${segDist.toFixed(2)}m (Running total: 0 + ${segDist.toFixed(2)}m)`);
        } else {
          console.log(`  Segment ${i}: ${segDist.toFixed(2)}m (Running Total: ${previousTotal.toFixed(2)} + ${segDist.toFixed(2)}m)`);
        }
      }
      
      // Set the total distance
      setTotalDistance(totalDist);
      console.log(`  TOTAL DISTANCE: ${totalDist.toFixed(2)}m`);
    }
    
    // Update distance labels
    updateDistanceLabels(currentPoints);
  }, [mapInstance]);

  /**
   * Update distance labels with polygon closure
   */
  const updateDistanceLabelsWithClosure = useCallback((currentPoints: MapPoint[]) => {
    if (!mapInstance) return;
    
    // Clear existing labels
    labelsRef.current.forEach(label => label.setMap(null));
    labelsRef.current = [];
    
    if (currentPoints.length < 2) return;
    
    // Convert points to coordinate format for segment calculation
    const coordinates: [number, number][] = currentPoints.map(point => [
      point.position.lat(),
      point.position.lng()
    ]);
    
    // Add the first point again to close the polygon
    coordinates.push([currentPoints[0].position.lat(), currentPoints[0].position.lng()]);
    
    // Calculate segment distances
    const segments = calculateSegmentDistances(coordinates);
    
    // Get current zoom level for styling
    const currentZoom = mapInstance.getZoom() || 14;
    const fontSize = getOptimalFontSize(currentZoom);
    
    // Create label for each segment's individual distance (not cumulative) at the midpoint
    segments.forEach((segment, index) => {
      const shouldShow = shouldShowLabel(index, segments.length, currentZoom);
      
      // Use the midpoint of the segment for better label placement
      const midPoint = new google.maps.LatLng(
        segment.midPoint[0],
        segment.midPoint[1]
      );
      
      const label = new google.maps.Marker({
        position: midPoint,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0, // Invisible marker
        },
        label: {
          text: formatRulerDistance(segment.segmentDistance), // Show individual segment distance
          color: '#1f2937',
          fontSize: fontSize,
          fontWeight: 'bold'
        },
        zIndex: 1000,
        visible: shouldShow
      });
      
      labelsRef.current.push(label);
    });
  }, [mapInstance, getOptimalFontSize, shouldShowLabel]);

  /**
   * Update distance labels along the measurement line
   */
  const updateDistanceLabels = useCallback((currentPoints: MapPoint[]) => {
    if (!mapInstance) return;
    
    // Clear existing labels
    labelsRef.current.forEach(label => label.setMap(null));
    labelsRef.current = [];
    
    if (currentPoints.length < 2) return;
    
    // Convert points to coordinate format for segment calculation
    const coordinates: [number, number][] = currentPoints.map(point => [
      point.position.lat(),
      point.position.lng()
    ]);
    
    // Calculate segment distances
    const segments = calculateSegmentDistances(coordinates);
    
    // Get current zoom level for styling
    const currentZoom = mapInstance.getZoom() || 14;
    const fontSize = getOptimalFontSize(currentZoom);
    
    // Create label for each segment's individual distance (not cumulative) at the midpoint
    segments.forEach((segment, index) => {
      const shouldShow = shouldShowLabel(index, segments.length, currentZoom);
      
      // Use the midpoint of the segment for better label placement
      const midPoint = new google.maps.LatLng(
        segment.midPoint[0],
        segment.midPoint[1]
      );
      
      const label = new google.maps.Marker({
        position: midPoint,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0, // Invisible marker
        },
        label: {
          text: formatRulerDistance(segment.segmentDistance), // Show individual segment distance
          color: '#1f2937',
          fontSize: fontSize,
          fontWeight: 'bold'
        },
        zIndex: 1000,
        visible: shouldShow
      });
      
      labelsRef.current.push(label);
    });
  }, [mapInstance, getOptimalFontSize, shouldShowLabel]);

  /**
   * Clear all measurement data and exit measurement mode
   */
  const clearMeasurement = useCallback(() => {
    console.log("Clearing all measurement data");
    
    // Remove click listener
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    
    // Remove zoom listener
    if (zoomListenerRef.current) {
      google.maps.event.removeListener(zoomListenerRef.current);
      zoomListenerRef.current = null;
    }
    
    // Remove mouse move listener
    if (mouseMoveListenerRef.current) {
      google.maps.event.removeListener(mouseMoveListenerRef.current);
      mouseMoveListenerRef.current = null;
    }
    
    // Remove the polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    
    // Remove the polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    
    // Remove all markers using the markers ref
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = []; // Clear the markers array
    
    // Remove all distance labels
    labelsRef.current.forEach(label => {
      label.setMap(null);
    });
    labelsRef.current = []; // Clear the labels array
    
    // Reset state
    setIsMeasuring(false);
    setPoints([]);
    setTotalDistance(0);
    setCompletedMeasurement(null);
    
    // Reset cursor
    if (mapInstance) {
      mapInstance.setOptions({ draggableCursor: 'inherit' });
    }

    // Extra validation to ensure all map elements are cleared
    if (mapInstance) {
      // Force map redraw to ensure all elements are removed
      setTimeout(() => {
        mapInstance.setZoom(mapInstance.getZoom() || 14);
      }, 50);
    }
  }, [mapInstance]);

  /**
   * Toggle between metric and imperial units
   */
  const toggleUnits = useCallback(() => {
    setUseMetric(prev => !prev);
  }, []);

  /**
   * Close the polygon and update distance labels
   */
  const closePolygon = useCallback((currentPoints: MapPoint[]) => {
    if (!mapInstance) return;

    // Recalculate perimeter from scratch
    let totalPerimeter = 0;
    console.log("🔄 Recalculating polygon perimeter:");
    
    // First, log all individual segments for clarity
    for (let i = 0; i < currentPoints.length; i++) {
      const startPoint = currentPoints[i];
      const endPoint = currentPoints[(i + 1) % currentPoints.length]; // Wrap to first point
      const segmentDistance = calculateHaversineDistance(
        startPoint.position.lat(), startPoint.position.lng(),
        endPoint.position.lat(), endPoint.position.lng()
      );
      
      // Store previous total for logging
      const prevTotal = totalPerimeter;
      totalPerimeter += segmentDistance;
      
      // Log with the user's requested format
      if (i === 0) {
        console.log(`  Segment ${i+1}: ${segmentDistance.toFixed(2)}m (Running total: 0 + ${segmentDistance.toFixed(2)}m)`);
      } else {
        console.log(`  Segment ${i+1}: ${segmentDistance.toFixed(2)}m (Running Total: ${prevTotal.toFixed(2)} + ${segmentDistance.toFixed(2)}m)`);
      }
    }
    
    console.log(`  🔢 FINAL PERIMETER: ${totalPerimeter.toFixed(2)}m`);

    // Set the correct total perimeter - both values must be set to ensure consistency
    setTotalDistance(totalPerimeter);
    setCompletedMeasurement(totalPerimeter);
    
    // Log what we're setting
    console.log(`  💾 Setting measurement values: totalDistance=${totalPerimeter.toFixed(2)}, completedMeasurement=${totalPerimeter.toFixed(2)}`);

    // Create closed polygon
    const positions = currentPoints.map(p => p.position);
    createClosedPolygon(positions);

    // Update distance labels
    updateDistanceLabelsWithClosure(currentPoints);

    // Reset cursor
    mapInstance.setOptions({ draggableCursor: 'inherit' });
    // setIsMeasuring(false);
  }, [mapInstance, createClosedPolygon, updateDistanceLabelsWithClosure]);

  /**
   * Setup and teardown map event listeners
   */
  useEffect(() => {
    if (!mapInstance) return;
    
    if (isMeasuring && !clickListenerRef.current) {
      // Add click handler
      clickListenerRef.current = mapInstance.addListener('click', handleMapClick);
      
      // Add mousemove handler to show cursor feedback when near first point
      mouseMoveListenerRef.current = mapInstance.addListener('mousemove', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng || points.length < 3) {
          mapInstance.setOptions({ draggableCursor: 'crosshair' });
          return;
        }
        
        // Check if hovering near first point
        if (points[0]?.marker && isNearPoint(e.latLng, points[0].position)) {
          mapInstance.setOptions({ draggableCursor: 'pointer' });
          
          // Make the first point pulse or change appearance
          points[0].marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12, // Make it larger when hovering nearby
            fillColor: '#10b981', // Brighter green
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 4,
          });
        } else {
          mapInstance.setOptions({ draggableCursor: 'crosshair' });
          
          // Reset first point appearance
          if (points[0]?.marker) {
            points[0].marker.setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 4,
            });
          }
        }
      });
    } else if (!isMeasuring && clickListenerRef.current) {
      // Remove click handler
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
      
      // Remove mouse move handler
      if (mouseMoveListenerRef.current) {
        google.maps.event.removeListener(mouseMoveListenerRef.current);
        mouseMoveListenerRef.current = null;
      }
    }
    
    // Cleanup on unmount or when measuring state changes
    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      if (mouseMoveListenerRef.current) {
        google.maps.event.removeListener(mouseMoveListenerRef.current);
        mouseMoveListenerRef.current = null;
      }
    };
  }, [mapInstance, isMeasuring, handleMapClick, points, isNearPoint]);

  /**
   * Attach click listener to the first marker so user can click directly on the green dot to close polygon
   */
  useEffect(() => {
    if (!isMeasuring || points.length < 3) {
      return; // Not measuring or not enough points
    }

    if (points[0]?.marker) {
      const markerListener = points[0].marker.addListener('click', () => {
        if (isMeasuring) {
          closePolygon(points);
        }
      });

      return () => {
        google.maps.event.removeListener(markerListener);
      };
    }
  }, [points, isMeasuring, closePolygon]);

  // Debug log the current state before returning
  console.log("Measurement hook state:", {
    totalDistance,
    formattedDistance,
    completedMeasurement,
    useMetric
  });

  return {
    isMeasuring,
    totalDistance,
    formattedDistance,
    points,
    completedMeasurement,
    toggleMeasurement,
    clearMeasurement,
    toggleUnits,
    useMetric
  };
};

export default useGoogleMeasurement;

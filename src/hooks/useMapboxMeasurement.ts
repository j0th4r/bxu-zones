/**
 * useMapboxMeasurement.ts
 * A custom hook to handle measurement functionality specifically for Mapbox GL JS
 */

import { useCallback, useEffect, useState } from 'react';
import { calculateHaversineDistance, formatDistance, calculateSegmentDistances, formatRulerDistance } from '../services/measurement-service';

// Define map point type
type MapPoint = {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  marker?: mapboxgl.Marker;
};

// Define hook return type
interface UseMapboxMeasurementReturn {
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
 * Custom hook for handling distance measurements on a Mapbox map
 * @param mapInstance - The Mapbox map instance
 * @returns Measurement state and functions
 */
export const useMapboxMeasurement = (mapInstance: any): UseMapboxMeasurementReturn => {
  // State to track if measurement mode is active
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  
  // State to track measurement points
  const [points, setPoints] = useState<MapPoint[]>([]);
  
  // Total distance in meters
  const [totalDistance, setTotalDistance] = useState<number>(0);
  
  // Use metric by default, can be toggled
  const [useMetric, setUseMetric] = useState<boolean>(true);

  // Layer and source IDs
  const LINE_SOURCE_ID = 'measure-line-source';
  const LINE_LAYER_ID = 'measure-line-layer';
  const POINT_SOURCE_ID = 'measure-point-source';
  const POINT_LAYER_ID = 'measure-point-layer';
  const LABEL_SOURCE_ID = 'measure-label-source';
  const LABEL_LAYER_ID = 'measure-label-layer';

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
      
      // Initialize map layers if needed
      if (mapInstance) {
        initializeMapLayers();
        
        // Set cursor to crosshair
        mapInstance.getCanvas().style.cursor = 'crosshair';
      }
    }
  }, [isMeasuring, mapInstance]);

  /**
   * Initialize map layers for measurement visualization
   */
  const initializeMapLayers = useCallback(() => {
    if (!mapInstance) return;
    
    // Remove existing layers and sources if they exist
    if (mapInstance.getLayer(LINE_LAYER_ID)) {
      mapInstance.removeLayer(LINE_LAYER_ID);
    }
    
    if (mapInstance.getLayer(POINT_LAYER_ID)) {
      mapInstance.removeLayer(POINT_LAYER_ID);
    }
    
    if (mapInstance.getLayer(LABEL_LAYER_ID)) {
      mapInstance.removeLayer(LABEL_LAYER_ID);
    }
    
    if (mapInstance.getSource(LINE_SOURCE_ID)) {
      mapInstance.removeSource(LINE_SOURCE_ID);
    }
    
    if (mapInstance.getSource(POINT_SOURCE_ID)) {
      mapInstance.removeSource(POINT_SOURCE_ID);
    }
    
    if (mapInstance.getSource(LABEL_SOURCE_ID)) {
      mapInstance.removeSource(LABEL_SOURCE_ID);
    }
    
    // Add a source for our line
    mapInstance.addSource(LINE_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });
    
    // Add a source for our points
    mapInstance.addSource(POINT_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    
    // Add a source for distance labels
    mapInstance.addSource(LABEL_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    
    // Add a layer to display the line
    mapInstance.addLayer({
      id: LINE_LAYER_ID,
      type: 'line',
      source: LINE_SOURCE_ID,
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });
    
    // Add a layer to display points
    mapInstance.addLayer({
      id: POINT_LAYER_ID,
      type: 'circle',
      source: POINT_SOURCE_ID,
      paint: {
        'circle-radius': 5,
        'circle-color': '#3b82f6',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
    
    // Add a layer to display distance labels
    mapInstance.addLayer({
      id: LABEL_LAYER_ID,
      type: 'symbol',
      source: LABEL_SOURCE_ID,
      layout: {
        'text-field': ['get', 'distance'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, -1.5],
        'text-anchor': 'bottom'
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });
  }, [mapInstance]);

  /**
   * Handle map click when in measuring mode
   */
  const handleMapClick = useCallback((e: any) => {
    if (!isMeasuring || !mapInstance) return;
    
    // Get coordinates from click event [longitude, latitude]
    const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    
    // Create a unique ID for this point
    const pointId = `point-${Date.now()}`;
    
    setPoints(prevPoints => {
      // Calculate new segment distance if this isn't the first point
      if (prevPoints.length > 0) {
        const prevPoint = prevPoints[prevPoints.length - 1];
        const segmentDistance = calculateHaversineDistance(
          prevPoint.coordinates[1], prevPoint.coordinates[0], // lat1, lng1
          coordinates[1], coordinates[0] // lat2, lng2
        );
        
        setTotalDistance(prev => prev + segmentDistance);
      }
      
      // Create new points array with the new point
      const newPoints = [...prevPoints, { id: pointId, coordinates }];
      
      // Update the line on the map
      updateLineOnMap(newPoints);
      
      return newPoints;
    });
  }, [isMeasuring, mapInstance]);

  /**
   * Update the line visualization on the map
   */
  const updateLineOnMap = useCallback((currentPoints: MapPoint[]) => {
    if (!mapInstance) return;
    
    // Extract just the coordinates for the GeoJSON
    const coordinates = currentPoints.map(point => point.coordinates);
    
    // Update the line source
    const lineSource = mapInstance.getSource(LINE_SOURCE_ID);
    if (lineSource && 'setData' in lineSource) {
      lineSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
    
    // Update the point source
    const pointSource = mapInstance.getSource(POINT_SOURCE_ID);
    if (pointSource && 'setData' in pointSource) {
      pointSource.setData({
        type: 'FeatureCollection',
        features: coordinates.map((coord, index) => ({
          type: 'Feature',
          properties: { index },
          geometry: {
            type: 'Point',
            coordinates: coord
          }
        }))
      });
    }
    
    // Update distance labels
    updateDistanceLabels(currentPoints);
  }, [mapInstance]);

  /**
   * Update distance labels for Mapbox
   */
  const updateDistanceLabels = useCallback((currentPoints: MapPoint[]) => {
    if (!mapInstance || currentPoints.length < 2) return;
    
    // Convert points to coordinate format for segment calculation [lat, lng]
    const coordinates: [number, number][] = currentPoints.map(point => [
      point.coordinates[1], // latitude
      point.coordinates[0]  // longitude
    ]);
    
    // Calculate segment distances
    const segments = calculateSegmentDistances(coordinates);
    
    // Create label features for each cumulative distance
    const labelFeatures = segments.map((segment, index) => {
      const endPoint = currentPoints[index + 1]; // Segment ends at next point
      return {
        type: 'Feature' as const,
        properties: {
          distance: formatRulerDistance(segment.cumulativeDistance)
        },
        geometry: {
          type: 'Point' as const,
          coordinates: endPoint.coordinates
        }
      };
    });
    
    // Update the label source
    const labelSource = mapInstance.getSource(LABEL_SOURCE_ID);
    if (labelSource && 'setData' in labelSource) {
      labelSource.setData({
        type: 'FeatureCollection',
        features: labelFeatures
      });
    }
  }, [mapInstance]);

  /**
   * Clear all measurement data and exit measurement mode
   */
  const clearMeasurement = useCallback(() => {
    setIsMeasuring(false);
    setPoints([]);
    setTotalDistance(0);
    
    // Remove map layers and reset cursor
    if (mapInstance) {
      // Remove layers if they exist - wrapped in try-catch for safety
      try {
        if (mapInstance.getLayer(LINE_LAYER_ID)) {
          mapInstance.removeLayer(LINE_LAYER_ID);
        }
        
        if (mapInstance.getLayer(POINT_LAYER_ID)) {
          mapInstance.removeLayer(POINT_LAYER_ID);
        }
        
        if (mapInstance.getSource(LINE_SOURCE_ID)) {
          mapInstance.removeSource(LINE_SOURCE_ID);
        }
        
        if (mapInstance.getSource(POINT_SOURCE_ID)) {
          mapInstance.removeSource(POINT_SOURCE_ID);
        }
      } catch (error) {
        console.warn('Error removing measurement layers:', error);
      }
      
      // Reset cursor
      mapInstance.getCanvas().style.cursor = '';
    }
  }, [mapInstance]);

  /**
   * Toggle between metric and imperial units
   */
  const toggleUnits = useCallback(() => {
    setUseMetric(prev => !prev);
  }, []);

  /**
   * Handle map click events
   */
  useEffect(() => {
    if (!mapInstance) return;
    
    if (isMeasuring) {
      mapInstance.on('click', handleMapClick);
    } else {
      mapInstance.off('click', handleMapClick);
    }
    
    return () => {
      if (mapInstance) {
        mapInstance.off('click', handleMapClick);
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

export default useMapboxMeasurement;

import { useCallback, useEffect, useState } from 'react';
import { calculateHaversineDistance, formatDistance } from '../services/measurement-service';

/**
 * Coordinates [longitude, latitude] - This follows the GeoJSON format used by Mapbox
 */
type Coordinates = [number, number];

/**
 * Hook to manage distance measurement functionality
 */
export const useMeasurement = (mapInstance: any) => {
  // State to track if measurement mode is active
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  
  // State to track measurement points
  const [points, setPoints] = useState<Coordinates[]>([]);
  
  // Total distance in meters
  const [totalDistance, setTotalDistance] = useState<number>(0);
  
  // Use metric by default, can be toggled
  const [useMetric, setUseMetric] = useState<boolean>(true);

  // Marker and line source IDs
  const MARKERS_SOURCE_ID = 'measure-markers-source';
  const LINE_SOURCE_ID = 'measure-line-source';
  
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
      
      // Initialize map sources and layers if needed
      initializeMapLayers();
    }
  }, [isMeasuring]);

  /**
   * Handle map click when in measuring mode
   */
  const handleMapClick = useCallback((e: any) => {
    if (!isMeasuring) return;
    
    // Get coordinates from the click event
    const coordinates: Coordinates = [e.lngLat.lng, e.lngLat.lat];
    
    // Add new point
    setPoints(prevPoints => {
      const newPoints = [...prevPoints, coordinates];
      
      // Calculate new distance if we have at least 2 points
      if (newPoints.length >= 2) {
        const lastPoint = prevPoints[prevPoints.length - 1];
        const newPoint = coordinates;
        
        // Calculate distance between last point and new point
        const segmentDistance = calculateHaversineDistance(
          lastPoint[1], lastPoint[0], 
          newPoint[1], newPoint[0]
        );
        
        // Update total distance
        setTotalDistance(prev => prev + segmentDistance);
      }
      
      // Update map visualization
      updateMapVisualization(newPoints);
      
      return newPoints;
    });
  }, [isMeasuring]);

  /**
   * Initialize map layers needed for measurement visualization
   */
  const initializeMapLayers = useCallback(() => {
    if (!mapInstance) return;
    
    // Check if sources already exist, remove them if they do
    if (mapInstance.getSource(MARKERS_SOURCE_ID)) {
      mapInstance.removeLayer('measure-markers-layer');
      mapInstance.removeSource(MARKERS_SOURCE_ID);
    }
    
    if (mapInstance.getSource(LINE_SOURCE_ID)) {
      mapInstance.removeLayer('measure-line-layer');
      mapInstance.removeSource(LINE_SOURCE_ID);
    }
    
    // Add sources for markers and line
    mapInstance.addSource(MARKERS_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    
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
    
    // Add layers for visualization
    mapInstance.addLayer({
      id: 'measure-line-layer',
      type: 'line',
      source: LINE_SOURCE_ID,
      paint: {
        'line-color': '#ff8800',
        'line-width': 2,
        'line-dasharray': [2, 1]
      }
    });
    
    mapInstance.addLayer({
      id: 'measure-markers-layer',
      type: 'circle',
      source: MARKERS_SOURCE_ID,
      paint: {
        'circle-radius': 5,
        'circle-color': '#ff8800',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
  }, [mapInstance]);

  /**
   * Update map visualization with current measurement points
   */
  const updateMapVisualization = useCallback((currentPoints: Coordinates[]) => {
    if (!mapInstance) return;
    
    // Update markers source
    const markerSource = mapInstance.getSource(MARKERS_SOURCE_ID);
    if (markerSource && 'setData' in markerSource) {
      markerSource.setData({
        type: 'FeatureCollection',
        features: currentPoints.map((point, index) => ({
          type: 'Feature',
          properties: { index },
          geometry: {
            type: 'Point',
            coordinates: point
          }
        }))
      });
    }
    
    // Update line source
    const lineSource = mapInstance.getSource(LINE_SOURCE_ID);
    if (lineSource && 'setData' in lineSource) {
      lineSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: currentPoints
        }
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
    
    // Clean up map layers if mapInstance exists
    if (mapInstance) {
      if (mapInstance.getLayer('measure-markers-layer')) {
        mapInstance.removeLayer('measure-markers-layer');
      }
      
      if (mapInstance.getLayer('measure-line-layer')) {
        mapInstance.removeLayer('measure-line-layer');
      }
      
      if (mapInstance.getSource(MARKERS_SOURCE_ID)) {
        mapInstance.removeSource(MARKERS_SOURCE_ID);
      }
      
      if (mapInstance.getSource(LINE_SOURCE_ID)) {
        mapInstance.removeSource(LINE_SOURCE_ID);
      }
    }
  }, [mapInstance]);

  /**
   * Toggle between metric and imperial units
   */
  const toggleUnits = useCallback(() => {
    setUseMetric(prev => !prev);
  }, []);

  /**
   * Format the current total distance for display
   */
  const formattedDistance = useCallback(() => {
    return formatDistance(totalDistance, !useMetric);
  }, [totalDistance, useMetric]);

  /**
   * Setup and teardown map event listeners
   */
  useEffect(() => {
    if (!mapInstance) return;
    
    if (isMeasuring) {
      // Add click handler
      mapInstance.on('click', handleMapClick);
      
      // Change cursor to crosshair
      mapInstance.getCanvas().style.cursor = 'crosshair';
    } else {
      // Remove click handler when not measuring
      mapInstance.off('click', handleMapClick);
      
      // Reset cursor
      mapInstance.getCanvas().style.cursor = '';
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstance) {
        mapInstance.off('click', handleMapClick);
        mapInstance.getCanvas().style.cursor = '';
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

export default useMeasurement;

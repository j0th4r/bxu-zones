/**
 * useMeasurementTool.ts
 * A wrapper hook that chooses the right measurement implementation based on the map provider
 */

import { useCallback, useMemo } from 'react';
import useGoogleMeasurement from './useGoogleMeasurement';
import useMapboxMeasurement from './useMapboxMeasurement';

interface UseMeasurementToolProps {
  mapProvider: 'google' | 'mapbox';
  mapInstance: any; // Can be google.maps.Map or mapboxgl.Map
}

/**
 * A hook to handle map measurements that works with either Google Maps or Mapbox
 */
export const useMeasurementTool = ({ mapProvider, mapInstance }: UseMeasurementToolProps) => {
  // Initialize the appropriate measurement hook based on the provider
  const googleMeasurement = useGoogleMeasurement(
    mapProvider === 'google' ? mapInstance : null
  );
  
  const mapboxMeasurement = useMapboxMeasurement(
    mapProvider === 'mapbox' ? mapInstance : null
  );
  
  // Use the active measurement hook based on provider
  const activeMeasurement = useMemo(() => {
    return mapProvider === 'google' ? googleMeasurement : mapboxMeasurement;
  }, [mapProvider, googleMeasurement, mapboxMeasurement]);
  
  // Handle measurement tool activation
  const startMeasurement = useCallback((type: 'distance' | 'area') => {
    // Currently only supporting distance measurements
    if (type === 'distance') {
      activeMeasurement.toggleMeasurement();
    }
  }, [activeMeasurement]);
  
  return {
    ...activeMeasurement,
    startMeasurement,
    measurementType: 'distance' as const, // For now, only distance is supported
  };
};

export default useMeasurementTool;

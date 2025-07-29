/**
 * MeasurementControls.tsx
 * Component to control the distance measurement feature
 */

import React, { useEffect } from 'react';
import { useMeasurementTool } from '../hooks/useMeasurementTool';
import MeasurementPanel from './MeasurementPanel';
import '../styles/measurement-styles.css';

interface MeasurementControlsProps {
  mapInstance: any; // The map instance (Google Maps or Mapbox)
  mapProvider: 'google' | 'mapbox';
  isActive: boolean;
  onStopMeasuring: () => void;
}

export const MeasurementControls: React.FC<MeasurementControlsProps> = ({
  mapInstance,
  mapProvider,
  isActive,
  onStopMeasuring,
}) => {
  // Only initialize the measurement tool if we have a map instance
  const {
    isMeasuring,
    formattedDistance,
    toggleMeasurement,
    clearMeasurement,
    toggleUnits,
    useMetric
  } = useMeasurementTool({
    mapProvider,
    mapInstance
  });

  // Start measuring when component becomes active and we have a map
  useEffect(() => {
    if (isActive && !isMeasuring && mapInstance) {
      toggleMeasurement();
    }
  }, [isActive, isMeasuring, toggleMeasurement, mapInstance]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Clear measurements when component unmounts
      if (isMeasuring) {
        clearMeasurement();
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount
  
  // Clean up when isActive becomes false
  useEffect(() => {
    if (!isActive && isMeasuring) {
      clearMeasurement();
    }
  }, [isActive, isMeasuring, clearMeasurement]);

  // Handle clearing measurements
  const handleClearMeasure = () => {
    clearMeasurement(); // First, clean up all map elements
    onStopMeasuring(); // Then notify parent to update UI state
  };

  return (
    <>
      {/* The measurement panel shows when there are measurements to display 
          or when actively measuring */}
      {(isMeasuring || (formattedDistance && formattedDistance !== '0 m' && formattedDistance !== '0 ft')) && (
        <MeasurementPanel
          distance={formattedDistance}
          onClear={handleClearMeasure}
          onToggleUnits={toggleUnits}
          useMetric={useMetric}
        />
      )}
    </>
  );
};

export default MeasurementControls;

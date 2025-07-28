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
  // Initialize the measurement tool
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

  // Start measuring when component mounts
  useEffect(() => {
    if (isActive && !isMeasuring) {
      toggleMeasurement();
    }
  }, [isActive, isMeasuring, toggleMeasurement]);

  // Clean up when component unmounts or becomes inactive
  useEffect(() => {
    return () => {
      if (isMeasuring) {
        clearMeasurement();
      }
    };
  }, []);

  // Clean up when isActive becomes false
  useEffect(() => {
    if (!isActive && isMeasuring) {
      clearMeasurement();
    }
  }, [isActive, isMeasuring, clearMeasurement]);

  // Handle clearing measurements
  const handleClearMeasure = () => {
    clearMeasurement();
    onStopMeasuring();
  };

  return (
    <>
      {/* The measurement panel only appears when measuring is active */}
      {isActive && isMeasuring && (
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

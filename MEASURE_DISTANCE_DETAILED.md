# Map Distance Measurement Feature

This document provides a detailed explanation of the "Measure Distance" feature implementation for your map-based web application.

## Overview

The distance measurement feature allows users to:
1. Activate a measurement mode via the UI
2. Click on the map to place markers and draw a polyline
3. See real-time distance calculations between points
4. View the total distance traveled along the path
5. Toggle between metric and imperial units
6. Clear measurements and exit measurement mode

## Implementation Components

### 1. Core Services & Utilities

- **`measurement-service.ts`**: Provides mathematical utilities for geographical distance calculations using the Haversine formula, which accounts for the Earth's curvature.
  
### 2. React Hooks

- **`useMeasurement.ts`**: Generic hook implementing the core measurement logic (in case you need a universal solution)
- **`useMapboxMeasurement.ts`**: Specific hook for Mapbox GL JS implementation
- **`useGoogleMeasurement.ts`**: Specific hook for Google Maps implementation
- **`useMeasurementTool.ts`**: Wrapper hook that automatically uses the correct implementation based on the current map provider

### 3. UI Components

- **`MeasurementPanel.tsx`**: Displays the measurement information and controls
- **`MeasurementControls.tsx`**: Container component that coordinates the measurement hooks with the UI

### 4. Styles

- **`measurement-styles.css`**: CSS styles for the measurement UI elements

## Integration Steps

1. Import the measurement components and hooks in your main map component
2. Add state to track when measurement mode is active
3. Add handlers for starting and stopping measurements
4. Render the `MeasurementControls` component when measurement is active
5. Pass the appropriate map instance to the controls

## Code Example

```tsx
// In your main map component
const [activeMeasurementTool, setActiveMeasurementTool] = useState<string | null>(null);

const handleMeasurementStart = (type: 'distance' | 'area') => {
  setActiveMeasurementTool(type);
};

const handleMeasurementStop = () => {
  setActiveMeasurementTool(null);
};

// In your JSX rendering
{activeMeasurementTool === 'distance' && (
  <MeasurementControls
    mapInstance={mapRef.current?.getMap()}
    mapProvider={currentMapProvider}
    isActive={true}
    onStartMeasuring={() => {}}
    onStopMeasuring={handleMeasurementStop}
  />
)}
```

## How the Distance Calculation Works

The distance calculation uses the Haversine formula to accurately calculate the great-circle distance between two points on the Earth's surface:

```typescript
export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Earth radius in meters
  const R = 6371000;

  // Convert latitude and longitude from degrees to radians
  const radLat1 = degreesToRadians(lat1);
  const radLng1 = degreesToRadians(lng1);
  const radLat2 = degreesToRadians(lat2);
  const radLng2 = degreesToRadians(lng2);

  // Calculate differences in coordinates
  const deltaLat = radLat2 - radLat1;
  const deltaLng = radLng2 - radLng1;

  // Haversine formula
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
};
```

## Handling Edge Cases

1. **Anti-meridian crossing**: The Haversine formula handles this correctly.
2. **Performance with many points**: The implementation efficiently updates only what's changed.
3. **Cleanup**: All event listeners and map objects are properly cleaned up when the measurement mode is exited.
4. **Unit conversion**: The feature automatically handles conversion between metric and imperial units.

## Future Enhancements

- Add area measurement capability
- Add ability to drag existing points
- Add elevation data where available
- Export measurements as GeoJSON

## Third-Party Dependencies

This implementation relies on:
- No external libraries for the distance calculation (pure JavaScript)
- The mapping libraries you already use (Google Maps or Mapbox GL JS)

## Troubleshooting

- If markers don't appear, ensure the map instance is correctly passed to the measurement controls
- If distances seem incorrect, check that coordinates are in the correct order (latitude, longitude)
- If event listeners aren't cleaning up, verify that the `clearMeasurement` function is being called when exiting measurement mode

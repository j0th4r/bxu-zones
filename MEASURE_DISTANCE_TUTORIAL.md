# Step-by-Step Guide to Add "Measure Distance" Feature

This guide walks you through integrating the distance measurement feature into your existing map-based web application.

## 1. Install the Required Files

All necessary files have been created. Here's what you'll find:

- **Services**
  - `src/services/measurement-service.ts`: Core functions for distance calculations
  
- **Hooks**
  - `src/hooks/useMeasurement.ts`: Generic measurement hook
  - `src/hooks/useMapboxMeasurement.ts`: Mapbox-specific implementation
  - `src/hooks/useGoogleMeasurement.ts`: Google Maps-specific implementation
  - `src/hooks/useMeasurementTool.ts`: Provider-agnostic wrapper hook

- **Components**
  - `src/components/MeasurementPanel.tsx`: UI for displaying measurements
  - `src/components/MeasurementControls.tsx`: Container for measurement interactions

- **Styles**
  - `src/styles/measurement-styles.css`: CSS for all measurement UI elements

## 2. Update App.tsx

Add the state and handlers for the measurement tool:

```tsx
// In App.tsx or your main map component
import { MeasurementControls } from './components/MeasurementControls';
import './styles/measurement-styles.css';

// Add this to your component's state
const [activeMeasurementTool, setActiveMeasurementTool] = useState<string | null>(null);

// Add these handlers
const handleMeasurementStart = (type: 'distance' | 'area') => {
  setActiveMeasurementTool(type);
};

const handleMeasurementStop = () => {
  setActiveMeasurementTool(null);
};
```

## 3. Update MapControls Props

Ensure your MapControls component receives the measurement handler:

```tsx
<MapControls
  // ... existing props
  onMeasurementStart={handleMeasurementStart}
  // ... other props
/>
```

## 4. Add MeasurementControls to the Map Container

Add the MeasurementControls component conditionally when the measurement tool is active:

```tsx
{/* Google Maps View */}
{currentMapProvider === 'google' && (
  <div className="map-container">
    <MapComponent
      // ... existing props
      activeMeasurementTool={activeMeasurementTool}
      // ... other props
    />
    
    {/* Add this block */}
    {activeMeasurementTool === 'distance' && (
      <MeasurementControls
        mapInstance={mapRef.current?.getMap()}
        mapProvider="google"
        isActive={activeMeasurementTool === 'distance'}
        onStartMeasuring={() => setActiveMeasurementTool('distance')}
        onStopMeasuring={handleMeasurementStop}
      />
    )}
  </div>
)}

{/* Mapbox View */}
{currentMapProvider === 'mapbox' && (
  <div className="map-container">
    <MapboxComponent
      // ... existing props
      activeMeasurementTool={activeMeasurementTool}
      // ... other props
    />
    
    {/* Add this block */}
    {activeMeasurementTool === 'distance' && (
      <MeasurementControls
        mapInstance={mapboxRef.current?.getMap()}
        mapProvider="mapbox"
        isActive={activeMeasurementTool === 'distance'}
        onStartMeasuring={() => setActiveMeasurementTool('distance')}
        onStopMeasuring={handleMeasurementStop}
      />
    )}
  </div>
)}
```

## 5. Add Style Import

Make sure the measurement styles are imported:

```tsx
// In App.tsx or your main component
import './styles/measurement-styles.css';
```

## 6. Test the Implementation

1. Run your application
2. Navigate to the map view
3. Click on the "Measure" tab in the sidebar
4. Click the "Measure Distance" button
5. Click on the map to place markers
6. Observe the distance panel showing the measurement
7. Toggle between metric and imperial units
8. Click "Clear" to exit measurement mode

## 7. Additional Notes

### For Google Maps Implementation

If you're using the Google Maps JavaScript API, ensure you have the geometry library loaded:

```typescript
// In your config or setup file
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'], // Add 'geometry' here
  // ... other options
};
```

### For Mapbox Implementation

Ensure you have the latest version of the Mapbox GL JS library:

```json
// In package.json
"dependencies": {
  "mapbox-gl": "^2.15.0",
  // ... other dependencies
}
```

## 8. Troubleshooting

- **Issue**: Measurement doesn't start when clicking the button
  - **Solution**: Verify that `handleMeasurementStart` is correctly passed to the MapControls component

- **Issue**: Map clicks don't register in measurement mode
  - **Solution**: Check that the map instance is correctly passed to the MeasurementControls component

- **Issue**: Distance calculation seems wrong
  - **Solution**: Ensure coordinates are correctly ordered as [latitude, longitude] for the Haversine function

- **Issue**: UI doesn't update after adding points
  - **Solution**: Check that state updates are triggering re-renders correctly

## 9. Next Steps

- Implement the area measurement feature using a similar approach
- Add the ability to edit placed points by dragging
- Add elevation data to calculate 3D distances
- Add the ability to save and load measurements

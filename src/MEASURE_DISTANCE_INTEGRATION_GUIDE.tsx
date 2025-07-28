/**
 * Integration Guide for "Measure Distance" Feature
 * 
 * This tutorial explains how to integrate the distance measurement functionality into your map-based application.
 */

// Step 1: Import the necessary components and hooks
import { MeasurementControls } from './components/MeasurementControls';
import { useMeasurementTool } from './hooks/useMeasurementTool';
import './styles/measurement-styles.css';

/**
 * Step 2: Update your App.tsx or main map component to handle measurement state
 * 
 * Add the following state to your component:
 */
const [activeMeasurementTool, setActiveMeasurementTool] = useState<string | null>(null);

/**
 * Step 3: Add a handler for measurement tool activation
 */
const handleMeasurementStart = (type: 'distance' | 'area') => {
  setActiveMeasurementTool(type);
};

const handleMeasurementStop = () => {
  setActiveMeasurementTool(null);
};

/**
 * Step 4: Update your MapControls component usage to pass the measurement handler
 */
<MapControls
  onZoomIn={() => mapRef.current?.zoomIn()}
  onZoomOut={() => mapRef.current?.zoomOut()}
  onFullscreen={handleToggleFullscreen}
  onLayerToggle={handleLayerToggle}
  onMeasurementStart={handleMeasurementStart}
  onMapStyleChange={handleMapStyleChange}
  onMapProviderChange={handleMapProviderChange}
  currentMapStyle={currentMapStyle}
  currentMapProvider={currentMapProvider}
  layerVisibility={layerVisibility}
  className="absolute top-4 right-4 z-10"
/>

/**
 * Step 5: Add the MeasurementControls component to your map container
 */
{/* Google Maps View */}
{currentMapProvider === 'google' && (
  <div className="map-container">
    <MapComponent
      ref={mapRef}
      onParcelClick={handleParcelClick}
      searchResults={searchResults}
      className={mapClassName}
      layerVisibility={layerVisibility}
      activeMeasurementTool={activeMeasurementTool}
      currentMapStyle={currentMapStyle}
      centerCoordinates={centerCoords}
      highlightedMarkerParcel={highlightedMarkerParcel}
      onMapClick={handleMapClick}
    />
    
    {/* Measurement Controls - show only when measurement tool is active */}
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

/**
 * Step 6: Similar integration for Mapbox
 */
{/* Mapbox View */}
{currentMapProvider === 'mapbox' && (
  <div className="map-container">
    <MapboxComponent
      ref={mapboxRef}
      onParcelClick={handleParcelClick}
      searchResults={searchResults}
      className={mapClassName}
      layerVisibility={layerVisibility}
      activeMeasurementTool={activeMeasurementTool}
      currentMapStyle={currentMapStyle}
      centerCoordinates={centerCoords}
      highlightedMarkerParcel={highlightedMarkerParcel}
      onMapClick={handleMapClick}
    />
    
    {/* Measurement Controls - show only when measurement tool is active */}
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

/**
 * Step 7: Handle cleanup when component unmounts
 * 
 * Make sure to add this to your useEffect cleanup function:
 */
useEffect(() => {
  // Other effect code...
  
  return () => {
    // If measurement is active when unmounting, clean it up
    if (activeMeasurementTool) {
      setActiveMeasurementTool(null);
    }
  };
}, []);

/**
 * Congratulations! You've now integrated the distance measurement feature into your map application.
 * 
 * Key features implemented:
 * 1. Toggle on/off distance measurement via UI button
 * 2. Click handling to place markers and calculate distances
 * 3. Real-time distance calculation using Haversine formula
 * 4. Clean display of distances in metric or imperial units
 * 5. Proper cleanup when exiting measurement mode
 */

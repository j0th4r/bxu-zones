import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { MapComponent } from './components/MapComponent';
import { SearchBar } from './components/SearchBar';
import { Legend } from './components/Legend';
import { ParcelPopup } from './components/ParcelPopup';
import { SearchResults } from './components/SearchResults';

import { MapControls } from './components/MapControls';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AISettings } from './components/AISettings';
import { ZoningCode } from './components/ZoningCode';
import { Regulations } from './components/Regulations';
import { FAQs } from './components/FAQs';
import { Import } from './components/Import';
import { Users } from './components/Users';
import { Shield, RefreshCw } from 'lucide-react';
import { ZoningDistrict, Parcel, SearchResult } from './types/zoning';
import { ZoningAPI } from './utils/api';
import { AZURE_MAPS_CONFIG } from './config/azure-maps';

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [zoningDistricts, setZoningDistricts] = useState<
    ZoningDistrict[]
  >([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(
    null
  );
  const [searchResults, setSearchResults] =
    useState<SearchResult | null>(null);
  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Map tools state
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    'Zoning Districts': true,
    'Zone Boundaries': true,
    'Buildings': true,
  });
  const [activeMeasurementTool, setActiveMeasurementTool] = useState<string | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>('road');

  useEffect(() => {
    loadZoningDistricts();
  }, []);

  const loadZoningDistricts = async () => {
    try {
      const districts = await ZoningAPI.getZoningDistricts();
      setZoningDistricts(districts);
    } catch (error) {
      console.error('Error loading zoning districts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParcelClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
  };

  const handleSearchResults = (results: SearchResult) => {
    setSearchResults(results);
  };

  const handleMapZoom = (direction: 'in' | 'out') => {
    // This would be handled by the map view
    console.log(`Zoom ${direction}`);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // Map tools handlers
  const handleLayerToggle = (layerName: string, visible: boolean) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: visible
    }));
    console.log(`Layer ${layerName} visibility: ${visible}`);
  };

  const handleMeasurementStart = (type: 'distance' | 'area') => {
    setActiveMeasurementTool(type);
    console.log(`Starting ${type} measurement`);
  };

  const handleAIAnalysis = (type: string) => {
    console.log(`Starting AI analysis: ${type}`);
    // This would trigger AI analysis of the current map view
  };

  const handleMapStyleChange = (style: string) => {
    setCurrentMapStyle(style);
    console.log(`Map style changed to: ${style}`);
  };

  return (
    <div className="relative h-screen bg-gray-800 text-white overflow-hidden">
      {/* Sticky Header */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-gray-700">
        <div className="p-4 flex justify-between items-center h-[80px]">
          <h1 className="text-xl font-bold text-white">
            BXU ZONES: Zoning Operations & Navigational E-System
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
            >
              <Shield size={16} />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={loadZoningDistricts}
              className="text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* AI Search Bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
        <SearchBar onSearchResults={handleSearchResults} />
      </div>

      {/* Search Results */}
      <SearchResults
        results={searchResults}
        onClose={() => setSearchResults(null)}
      />

      {/* Main Map */}
      <main className="h-full pt-16">
        <MapComponent
          onParcelClick={handleParcelClick}
          searchResults={searchResults}
          className="w-full h-full"
          subscriptionKey={AZURE_MAPS_CONFIG.subscriptionKey}
          layerVisibility={layerVisibility}
          activeMeasurementTool={activeMeasurementTool}
          currentMapStyle={currentMapStyle}
        />
      </main>

      {/* Map Controls */}
      <MapControls
        onZoomIn={() => handleMapZoom('in')}
        onZoomOut={() => handleMapZoom('out')}
        onFullscreen={handleFullscreen}
        onLayerToggle={handleLayerToggle}
        onMeasurementStart={handleMeasurementStart}
        onAIAnalysis={handleAIAnalysis}
        onMapStyleChange={handleMapStyleChange}
        currentMapStyle={currentMapStyle}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Legend
          districts={zoningDistricts}
          isVisible={isLegendVisible}
          onToggle={() => setIsLegendVisible(!isLegendVisible)}
        />
      </div>

      {/* Parcel Details Popup */}
      <ParcelPopup
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
      />

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-xs text-gray-400 z-10">
        © Esri © OpenStreetMap contributors
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-xl">
              Loading Butuan City Zoning Map...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Initializing ESRI mapping services
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="zoning-code" element={<ZoningCode />} />
          <Route path="regulations" element={<Regulations />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="import" element={<Import />} />
          <Route path="ai-settings" element={<AISettings />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

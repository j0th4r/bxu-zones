import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MapComponent, MapComponentRef } from './components/MapComponent';
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
import { ZoningDistrict, Parcel, SearchResult, SuppliersResponse } from './types/zoning';
import { ZoningAPI } from './utils/api';
import { GOOGLE_MAPS_CONFIG } from './config/google-maps';


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
  const [resultsMinimized, setResultsMinimized] = useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Map tools state
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    'traffic': false,
    'transit': false,
    'Zoning Districts': true,
    'streetView': GOOGLE_MAPS_CONFIG.mapLayers.streetView
  });
  const [activeMeasurementTool, setActiveMeasurementTool] = useState<string | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(GOOGLE_MAPS_CONFIG.mapStyles.default);
  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null);
  const mapRef = useRef<MapComponentRef>(null);

  // Supplier state - persists across popup close/open cycles
  const [supplierData, setSupplierData] = useState<SuppliersResponse | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

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
    // Store the parcel and search context
    const currentSearchContext = searchResults?.query || '';
    
    setSelectedParcel(parcel);
    // Minimize AI search results when user clicks a parcel on the map
    setResultsMinimized(true);
    
    // Always fetch new suppliers when a parcel is clicked, passing the current search context
    if (parcel.geometry) {
      // Only fetch suppliers for parcels with geometry (actual parcel or search result)
      handleFetchSuppliers(parcel, currentSearchContext);
    } else {
      // Clear any supplier data when clicking zoning area
      setSupplierData(null);
    }
  };

  const handleFetchSuppliers = async (parcel: Parcel, searchContext: string) => {
    setLoadingSuppliers(true);
    // Clear existing supplier data before fetching new data
    setSupplierData(null);
    try {
      const suppliers = await ZoningAPI.getNearestSuppliers(
        parcel.address, 
        searchContext || searchResults?.query
      );
      setSupplierData(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Set fallback supplier data on error
      setSupplierData({
        suppliers: [
          {
            name: 'Error - No Suppliers Found',
            phone: '+63 900 000 0000',
            business: 'Service Temporarily Unavailable',
            address: 'Please try again later',
            distance_km: 0
          }
        ],
        searchLocation: parcel.address,
        contextQuery: searchContext || searchResults?.query
      });
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleSearchResults = (results: SearchResult) => {
    setSearchResults(results);
    // Ensure results are expanded when new search is performed
    setResultsMinimized(false);
    
    // Clear supplier data when performing a new search
    setSupplierData(null);
    
    // Clear selected parcel when performing a new search
    setSelectedParcel(null);
  };

  const handleSelectSearchParcel = (parcel: Parcel) => {
    // If parcel geometry coordinates provided, center map
    if (parcel.geometry && parcel.geometry.coordinates) {
      const coords = parcel.geometry.coordinates as [number, number];
      setCenterCoords([...coords] as [number, number]);
    } else if (parcel.attributes?.coordinates && Array.isArray(parcel.attributes.coordinates)) {
      const coords = parcel.attributes.coordinates as [number, number];
      setCenterCoords([...coords] as [number, number]);
    }
    // Do not open parcel details; just recenter the map
    if (selectedParcel) {
      setSelectedParcel(null);
    }

    // Minimize AI search results after selecting a parcel
    setResultsMinimized(true);
  };

  const handleMapZoom = (direction: 'in' | 'out') => {
    if (!mapRef.current) return;
    if (direction === 'in') {
      mapRef.current.zoomIn();
    } else {
      mapRef.current.zoomOut();
    }
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

  const handleZoningDistrictClick = (district: ZoningDistrict) => {
    // Convert ZoningDistrict to Parcel format for the popup
    const mockParcel: Parcel = {
      id: district.id,
      address: district.name,
      zoneId: district.type,
      geometry: null, // No point geometry - indicates this is a zoning area
      attributes: {
        OBJECTID: district.id,
        ZONE_NAME: district.name,
        ZONE_TYPE: district.type,
        DESCRIPTION: district.description,
        ADDRESS: district.name,
        regulations: `Max Height: ${district.bulkRules.maxHeight}, FAR: ${district.bulkRules.farRatio}, Lot Coverage: ${district.bulkRules.lotCoverage}`,
        allowedUses: district.allowedUses.join(', ')
      },
    };
    
    // Set the mock parcel to trigger the popup
    setSelectedParcel(mockParcel);
    
    // Clear supplier data since this is a zoning area, not a specific parcel
    setSupplierData(null);
  };

  return (
    <div className="relative h-screen bg-gray-800 text-white overflow-hidden">
      {/* Sticky Header */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-gray-700">
        <div className="p-4 flex justify-between items-center h-[80px]">
          <h1 className="text-xl font-bold text-white">
            Butuan City Zoning Map
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
        onSelectParcel={handleSelectSearchParcel}
        isMinimized={resultsMinimized}
        onToggleMinimize={() => setResultsMinimized((prev) => !prev)}
      />

      {/* Main Map */}
      <main className="h-full pt-16">
        <MapComponent
          ref={mapRef}
          onParcelClick={handleParcelClick}
          searchResults={searchResults}
          className="w-full h-full"
          layerVisibility={layerVisibility}
          activeMeasurementTool={activeMeasurementTool}
          currentMapStyle={currentMapStyle}
          centerCoordinates={centerCoords}
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
        layerVisibility={layerVisibility}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Legend
          districts={zoningDistricts}
          isVisible={isLegendVisible}
          onToggle={() => setIsLegendVisible(!isLegendVisible)}
          onZoningDistrictClick={handleZoningDistrictClick}
        />
      </div>

      {/* Parcel Details Popup */}
      <ParcelPopup
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
        contextQuery={searchResults?.query}
        supplierData={supplierData}
        loadingSuppliers={loadingSuppliers}
        onRefreshSuppliers={() => selectedParcel && handleFetchSuppliers(selectedParcel, searchResults?.query || '')}
      />



      {/* Map Attribution */}
      <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-xs text-gray-400 z-10">
        © Google Maps
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

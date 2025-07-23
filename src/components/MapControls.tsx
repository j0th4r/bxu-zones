import React, {useState} from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Ruler,
  Sparkles,
  PanelRightClose,
  PanelRight,
  MapPin,
  BarChart3,
  Building,
  TreePine,
  Satellite,
  Globe,
  Map,
  Car,
  Train,
  Mountain,
} from 'lucide-react';
import { GOOGLE_MAPS_CONFIG } from '../config/google-maps';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  onLayerToggle?: (layerName: string, visible: boolean) => void;
  onMeasurementStart?: (type: 'distance' | 'area') => void;
  onAIAnalysis?: (type: string) => void;
  onMapStyleChange?: (style: string) => void;
  currentMapStyle?: string;
  className?: string;
  layerVisibility?: { [key: string]: boolean };
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onLayerToggle,
  onMeasurementStart,
  onAIAnalysis,
  onMapStyleChange,
  currentMapStyle = 'road',
  className = '',
  layerVisibility = {}
}) => {
  const [isMapToolsVisible, setIsMapToolsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'layers' | 'measure' | 'ai'>(
    'layers'
  );

  const [aiAnalysisData] = useState({
    zoningDistricts: [
      {
        code: 'R-1',
        name: 'Low-Density Single Family',
        far: 0.6,
        height: '2 stories',
      },
      {
        code: 'R-3',
        name: 'High-Density Residential',
        far: 2.5,
        height: '6 stories',
      },
      {
        code: 'C-3',
        name: 'Central Business District',
        far: 8.0,
        height: '15 stories',
      },
      {
        code: 'MU-2',
        name: 'Medium-Intensity Mixed Use',
        far: 4.0,
        height: '8 stories',
      },
      {
        code: 'IN-1',
        name: 'Educational Zone',
        far: 'varies',
        height: '10 stories',
      },
    ],
    landUsePatterns:
      'Butuan City demonstrates a typical Philippine urban pattern with concentrated commercial zones along major streets (J.C. Aquino Avenue), residential subdivisions in quieter areas, and institutional zones for education and government. The mix creates walkable neighborhoods with good access to services.',
    developmentPotential:
      'The C-3 Central Business District allows high-rise development up to 15 stories with FAR 8.0, indicating significant vertical development potential. Mixed-use zones encourage transit-oriented development. The university area shows potential for student housing and related services.',
    relevantSections: [
      'P.D. 1096 - National Building Code',
      'Butuan City Zoning Ordinance 2023',
    ],
  });

  const toggleMapTools = () => {
    setIsMapToolsVisible(!isMapToolsVisible);
  };

  const handleAIAnalyze = () => {
    if (onAIAnalysis) {
      onAIAnalysis('current-view');
    }
  };

  const renderLayersPanel = () => {
    
    return (
    <div className="space-y-4 w-full">
      {/* Map Style Section */}
      <div className="w-full">
        <div className="flex items-center space-x-2 mb-3">
          <Globe size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-white text-sm font-medium">Base Map</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {Object.entries(GOOGLE_MAPS_CONFIG.mapStyles).map(([key, style]) => (
            <button
              key={key}
              onClick={() => onMapStyleChange?.(style)}
              className={`p-2 rounded-md text-xs transition-colors flex items-center space-x-1 w-full justify-center ${
                currentMapStyle === style
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">
                {key === 'satellite' ? (
                  <Satellite size={12} />
                ) : key === 'terrain' ? (
                  <Mountain size={12} />
                ) : (
                  <Map size={12} />
                )}
              </div>
              <span className="truncate capitalize">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Layers Section */}
      <div className="w-full mt-4">
        <div className="flex items-center space-x-2 mb-3">
          <Layers size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-white text-sm font-medium">Map Details</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onLayerToggle?.('traffic', !layerVisibility['traffic'])}
            className={`p-2 rounded-md text-xs transition-colors flex items-center space-x-2 w-full ${
              layerVisibility['traffic']
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Car size={12} />
            <span>Traffic</span>
          </button>
          <button
            onClick={() => onLayerToggle?.('transit', !layerVisibility['transit'])}
            className={`p-2 rounded-md text-xs transition-colors flex items-center space-x-2 w-full ${
              layerVisibility['transit']
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Train size={12} />
            <span>Transit</span>
          </button>
          {/* Terrain and Street View buttons removed */}
        </div>
      </div>
    </div>
  );
};

  const renderMeasurePanel = () => (
    <div className="space-y-4 w-full">
      <button
        onClick={() => onMeasurementStart?.('distance')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 min-h-[40px]"
      >
        <Ruler size={16} className="flex-shrink-0" />
        <span className="truncate">Measure Distance</span>
      </button>
      <button
        onClick={() => onMeasurementStart?.('area')}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 min-h-[40px]"
      >
        <BarChart3 size={16} className="flex-shrink-0" />
        <span className="truncate">Measure Area</span>
      </button>
      <div className="mt-4 p-3 bg-gray-700 rounded-md">
        <h4 className="text-white text-sm font-medium mb-2">Instructions:</h4>
        <p className="text-gray-300 text-xs leading-relaxed">
          Click to start measuring. Click again to add points. Double-click to
          finish.
        </p>
      </div>
    </div>
  );

  const renderAIPanel = () => (
    <div className="space-y-4 w-full">
      <button
        onClick={handleAIAnalyze}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
      >
        <Sparkles size={16} className="flex-shrink-0" />
        <span>Analyze Current View</span>
      </button>

      {/* AI Analysis Results */}
      <div className="space-y-4 mt-6 max-h-80 overflow-y-auto border-t border-gray-600">
        <div className="flex items-center space-x-2 text-blue-400 sticky top-0 bg-gray-800 pb-2 z-10">
          <Sparkles size={16} className="flex-shrink-0" />
          <span className="text-sm font-medium pt-4">AI Analysis</span>
        </div>

        {/* Zoning Districts */}
        <div className="pr-3 pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium">
              Zoning Districts
            </span>
          </div>
          <div className="space-y-2">
            {aiAnalysisData.zoningDistricts.map((zone, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded text-xs">
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="text-blue-400 font-medium flex-shrink-0">
                    {zone.code}
                  </span>
                  <span className="text-gray-300 truncate">{zone.name}</span>
                </div>
                <div className="flex justify-between text-gray-400 gap-2">
                  <span className="flex-shrink-0">FAR: {zone.far}</span>
                  <span className="truncate">Height: {zone.height}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Land Use Patterns */}
        <div className="pr-3 pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <Building size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium">
              Land Use Patterns
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed whitespace-normal">
            {aiAnalysisData.landUsePatterns}
          </p>
        </div>

        {/* Development Potential */}
        <div className="pr-3 pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <TreePine size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium">
              Development Potential
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed whitespace-normal">
            {aiAnalysisData.developmentPotential}
          </p>
        </div>

        {/* Relevant Sections */}
        <div className="pr-3 pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium">
              Relevant Sections
            </span>
          </div>
          <div className="space-y-1">
            {aiAnalysisData.relevantSections.map((section, index) => (
              <div
                key={index}
                className="text-blue-400 text-xs hover:text-blue-300 cursor-pointer break-words"
              >
                {section}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Zoom Controls */}
      <div className={`flex flex-col space-y-2 ${className}`}>
        <button
          onClick={onZoomIn}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-md shadow-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="text-white" size={20} />
        </button>
        <button
          onClick={onZoomOut}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-md shadow-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="text-white" size={20} />
        </button>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 z-10 space-y-2">
        <button
          onClick={onFullscreen}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-md shadow-lg transition-colors block"
          title="Fullscreen"
        >
          <Maximize className="text-white" size={20} />
        </button>
      </div>

      {/* Map Tools Panel */}
      <div className="absolute top-1/4 right-4 z-10">
        <div
          className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
            isMapToolsVisible
              ? 'w-auto min-w-80 max-w-96 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto max-h-[70vh]'
              : 'w-12 h-auto'
          }`}
        >
          <div
            className={`flex justify-between items-center border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${
              isMapToolsVisible ? 'p-4' : 'p-[0.8rem] justify-center'
            }`}
            onClick={toggleMapTools}
          >
            <h2
              className={`font-bold text-white transition-all duration-300 ${
                isMapToolsVisible
                  ? 'opacity-100'
                  : 'opacity-0 w-0 overflow-hidden'
              }`}
            >
              Map Tools
            </h2>
            <div className="flex-shrink-0">
              {isMapToolsVisible ? (
                <PanelRightClose className="text-gray-400" size={20} />
              ) : (
                <PanelRight className="text-gray-400" size={20} />
              )}
            </div>
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              isMapToolsVisible
                ? 'max-h-[calc(85vh-4rem)] opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 max-h-[calc(85vh-4rem)] overflow-y-auto overflow-x-hidden">
              {/* Tab Navigation */}
              <div className="flex justify-around items-center bg-gray-700 rounded-md p-1 mb-4 flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`py-2 px-2 sm:px-3 text-xs rounded-md flex items-center transition-colors flex-1 min-w-0 justify-center ${
                    activeTab === 'layers'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers className="mr-1 flex-shrink-0" size={12} />
                  <span className="truncate">Layers</span>
                </button>
                <button
                  onClick={() => setActiveTab('measure')}
                  className={`py-2 px-2 sm:px-3 text-xs rounded-md flex items-center transition-colors flex-1 min-w-0 justify-center ${
                    activeTab === 'measure'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Ruler className="mr-1 flex-shrink-0" size={12} />
                  <span className="truncate">Measure</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`py-2 px-2 sm:px-3 text-xs rounded-md flex items-center transition-colors flex-1 min-w-0 justify-center ${
                    activeTab === 'ai'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="mr-1 flex-shrink-0" size={12} />
                  <span className="truncate">AI Tools</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-fit">
                {activeTab === 'layers' && renderLayersPanel()}
                {activeTab === 'measure' && renderMeasurePanel()}
                {activeTab === 'ai' && renderAIPanel()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

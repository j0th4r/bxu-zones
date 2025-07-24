import React, {useState} from 'react';
import {CheckCircle, Minus, Maximize2, Shield, Download, TrendingUp} from 'lucide-react';
import {SearchResult, SafetyRequirement} from '../types/zoning';

interface SearchResultsProps {
  results: SearchResult | null;
  onClose: () => void;
  onSelectParcel?: (parcel: any) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onCompareLocations?: (parcels: any[]) => void;
  isLoadingBusinessRating?: boolean;
  hasBusinessRatingData?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onClose,
  onSelectParcel,
  isMinimized,
  onToggleMinimize,
  onCompareLocations,
  isLoadingBusinessRating = false,
  hasBusinessRatingData = false,
}) => {

  if (!results) return null;

  const hasSafety = results.results.safetyRequirements && results.results.safetyRequirements.length > 0;
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements'>('overview');

  const formsNeeded = [

    {
      title: 'Request Form - Business Permit Revision',
      published: 'Dec 18 2022',
    },
    {
      title: 'Request Form - Certificate of Good Moral Character',
      published: 'Dec 18 2022',
    },
    {
      title: 'Request Form - Certification / Certified True Copy',
      published: 'Dec 18 2022',
    },
  ];

  return (
    <div className="absolute top-48 left-4 right-4 z-20 max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 pt-[0] p-4 max-h-[70vh] overflow-y-auto w-auto min-w-80">
        <div className="flex justify-between items-start sticky top-0 bg-gray-800 z-10 pt-4">
          <h3 className="text-white font-semibold">AI Search Results</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMinimize}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b border-gray-700 mb-3 px-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1 px-3 text-xs rounded-t-md transition-colors ${activeTab==='overview' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}`}
              >Overview</button>
              {hasSafety && (
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`py-1 px-3 text-xs rounded-t-md transition-colors ${activeTab==='requirements' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}`}
                >Requirements</button>
              )}
            </div>

          {activeTab==='overview' && (
          <div className="space-y-3 pr-2">
            <div className="mt-4 text-gray-300 text-sm leading-relaxed whitespace-normal">
              {results.results.summary}
            </div>

            {results.results.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">Key Points:</h4>
                {results.results.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle
                      size={14}
                      className="text-green-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-300 text-xs leading-relaxed break-words">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {results.results.parcels.length > 0 && (
              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">
                    Found {results.results.parcels.length} parcel(s)
                  </h4>
                  {results.results.parcels.length >= 2 && onCompareLocations && (
                    <div className="flex items-center space-x-2">
                      {isLoadingBusinessRating && (
                        <div className="flex items-center space-x-1 text-blue-400 text-xs">
                          <div className="animate-spin h-3 w-3 border border-blue-400 border-t-transparent rounded-full"></div>
                          <span>Preparing...</span>
                        </div>
                      )}
                      {!isLoadingBusinessRating && hasBusinessRatingData && (
                        <div className="flex items-center space-x-1 text-green-400 text-xs">
                          <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                          <span>Ready</span>
                        </div>
                      )}
                      <button
                        onClick={() => onCompareLocations(results.results.parcels)}
                        disabled={isLoadingBusinessRating}
                        className={`flex items-center space-x-1 px-2 py-1 text-white text-xs rounded transition-colors ${
                          isLoadingBusinessRating 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : hasBusinessRatingData
                            ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400 ring-opacity-50'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                        title={hasBusinessRatingData ? "View prepared business comparison" : "Compare business potential of all parcels"}
                      >
                        <TrendingUp size={12} />
                        <span>{hasBusinessRatingData ? "View Rankings" : "Compare Locations"}</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {results.results.parcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      onClick={() => onSelectParcel?.(parcel)}
                      className="space-y-1 p-2 bg-gray-700/50 rounded border-l-2 border-blue-400 cursor-pointer hover:bg-gray-600/70 transition-colors"
                    >
                      <div className="text-xs text-gray-300 font-medium break-words">
                        {parcel.address}
                      </div>
                      {parcel.attributes.coordinates && (
                        <div className="text-xs text-gray-400 flex items-center space-x-1">
                          <span>📍</span>
                          <span>
                            {parcel.attributes.coordinates[1].toFixed(4)},{' '}
                            {parcel.attributes.coordinates[0].toFixed(4)}
                          </span>
                        </div>
                      )}
                      {parcel.attributes.relevance && (
                        <div className="text-xs text-blue-300 break-words leading-relaxed">
                          {parcel.attributes.relevance}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {activeTab==='requirements' && hasSafety && (
            <div className="space-y-4 pr-2">
              {/* Forms Needed Section */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-2">Forms Needed</h4>
                <div className="space-y-2">
                  {formsNeeded.map((form, idx)=> (
                    <div key={idx} className="bg-gray-700/50 p-2 rounded text-xs flex justify-between items-center">
                      <div className="flex-1 cursor-pointer">
                        <span className="text-gray-300 truncate pr-2 hover:text-white">{form.title}</span>
                        <div className="text-gray-500 text-[10px]">{form.published}</div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white flex-shrink-0" title="Download form">
                        <Download size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Requirements Section */}
              <div className="pt-3 border-t border-gray-700 space-y-4">
                <h4 className="text-white text-sm font-semibold">Safety Requirements</h4>
                {results.results.safetyRequirements!.map((req: SafetyRequirement, idx: number) => (
                  <div key={idx} className="bg-gray-700/50 p-3 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield size={14} className="text-yellow-400 flex-shrink-0" />
                      <h4 className="text-white text-xs font-semibold uppercase tracking-wide">{req.title}</h4>
                    </div>
                    <p className="text-gray-300 text-xs whitespace-pre-line leading-relaxed">
                      {req.details}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-gray-400 text-xs leading-relaxed mt-2">
                Following these requirements ensures compliance, safeguards public welfare, and streamlines the permitting process for your proposed business.
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

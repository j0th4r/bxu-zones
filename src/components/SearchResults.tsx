import React, {useState} from 'react';
import {CheckCircle, Minus, Maximize2} from 'lucide-react';
import {SearchResult} from '../types/zoning';

interface SearchResultsProps {
  results: SearchResult | null;
  onClose: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!results) return null;

  return (
    <div className="absolute top-48 left-4 right-4 z-20 max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 pt-[0] p-4 max-h-[70vh] overflow-y-auto w-auto min-w-80">
        <div className="flex justify-between items-start sticky top-0 bg-gray-800 z-10 pt-4">
          <h3 className="text-white font-semibold">AI Search Results</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
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
                <h4 className="text-white font-medium text-sm mb-2">
                  Found {results.results.parcels.length} parcel(s)
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {results.results.parcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      className="space-y-1 p-2 bg-gray-700/50 rounded border-l-2 border-blue-400"
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
      </div>
    </div>
  );
};

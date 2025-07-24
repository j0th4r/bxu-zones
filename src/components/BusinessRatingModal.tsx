import React from 'react';
import { X, TrendingUp, MapPin, Star, Users, Car, Building, Zap, Target } from 'lucide-react';
import { BusinessRating, BusinessRatingResponse } from '../types/zoning';

interface BusinessRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratingData: BusinessRatingResponse | null;
  isLoading: boolean;
}

export const BusinessRatingModal: React.FC<BusinessRatingModalProps> = ({
  isOpen,
  onClose,
  ratingData,
  isLoading
}) => {
  if (!isOpen) return null;

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'accessibility': return <Car size={16} className="text-blue-400" />;
      case 'footTraffic': return <Users size={16} className="text-green-400" />;
      case 'demographics': return <Target size={16} className="text-purple-400" />;
      case 'competition': return <TrendingUp size={16} className="text-orange-400" />;
      case 'infrastructure': return <Zap size={16} className="text-yellow-400" />;
      default: return <Building size={16} className="text-gray-400" />;
    }
  };

  const getFactorName = (factor: string) => {
    switch (factor) {
      case 'accessibility': return 'Accessibility';
      case 'footTraffic': return 'Foot Traffic';
      case 'demographics': return 'Demographics';
      case 'competition': return 'Competition';
      case 'infrastructure': return 'Infrastructure';
      default: return factor;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-400';
    if (rating >= 60) return 'text-yellow-400';
    if (rating >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-black';
    return 'bg-gray-600 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <TrendingUp size={24} className="text-green-400" />
            <h2 className="text-2xl font-bold text-white">Business Location Rankings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Analyzing locations...</p>
                <p className="text-gray-500 text-sm mt-2">AI is evaluating business potential</p>
              </div>
            </div>
          ) : ratingData ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Analysis Summary</h3>
                <p className="text-gray-300">{ratingData.summary}</p>
                <p className="text-gray-400 text-sm mt-2">{ratingData.methodology}</p>
              </div>

              {/* Rankings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Parcel Rankings</h3>
                {ratingData.ratings.map((rating: BusinessRating) => (
                  <div key={rating.parcelId} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                    {/* Header with rank and rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRatingBadgeColor(rating.rank)}`}>
                          #{rating.rank}
                        </div>                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-blue-400" />
                          <span className="text-white font-medium">{rating.address}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star size={16} className={getRatingColor(rating.rating)} />
                        <span className={`text-2xl font-bold ${getRatingColor(rating.rating)}`}>
                          {rating.rating}%
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm">{rating.explanation}</p>
                    </div>

                    {/* Factor breakdown */}
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(rating.factors).map(([factor, value]) => (
                        <div key={factor} className="text-center">
                          <div className="flex justify-center mb-1">
                            {getFactorIcon(factor)}
                          </div>
                          <div className={`text-sm font-semibold ${getRatingColor(value)}`}>
                            {value}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {getFactorName(factor)}
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                value >= 80 ? 'bg-green-400' :
                                value >= 60 ? 'bg-yellow-400' :
                                value >= 40 ? 'bg-orange-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Rating Factors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Car size={14} className="text-blue-400" />
                    <span className="text-gray-300">Accessibility: Transportation & roads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={14} className="text-green-400" />
                    <span className="text-gray-300">Foot Traffic: Pedestrian activity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target size={14} className="text-purple-400" />
                    <span className="text-gray-300">Demographics: Target market</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={14} className="text-orange-400" />
                    <span className="text-gray-300">Competition: Market saturation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-gray-300">Infrastructure: Utilities & services</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No Rating Data</h3>
              <p className="text-gray-400">Select multiple parcels to generate business ratings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
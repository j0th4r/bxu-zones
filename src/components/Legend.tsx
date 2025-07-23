import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';
import { ZoningDistrict } from '../types/zoning';

interface LegendProps {
  districts: ZoningDistrict[];
  isVisible: boolean;
  onToggle: () => void;
  onZoningDistrictClick?: (district: ZoningDistrict) => void;
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({ 
  districts, 
  isVisible, 
  onToggle, 
  onZoningDistrictClick,
  className = '' 
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<ZoningDistrict | null>(null);

  return (
    <div className={`w-64 ${className}`}>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={onToggle}
        >
          <h2 className="font-bold text-white">BXU Zoning Legend</h2>
          {isVisible ? (
            <ChevronDown className="text-gray-400" size={20} />
          ) : (
            <ChevronUp className="text-gray-400" size={20} />
          )}
        </div>
        
        {isVisible && (
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {districts.map((district) => (
              <div key={district.id} className="group">
                <div className="flex items-center justify-between hover:bg-gray-700 p-2 rounded transition-colors">
                  <div className="flex items-center">
                    <span 
                      className="w-4 h-4 rounded-sm mr-3"
                      style={{ backgroundColor: district.color }}
                    />
                    <span className="text-white text-sm">{district.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onZoningDistrictClick) {
                        onZoningDistrictClick(district);
                      } else {
                        // Fallback to inline display if no callback provided
                        setSelectedDistrict(
                          selectedDistrict?.id === district.id ? null : district
                        );
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </div>
                
                {selectedDistrict?.id === district.id && (
                  <div className="mt-2 p-3 bg-gray-700 rounded text-xs text-gray-300 space-y-2">
                    <p>{district.description}</p>
                    <div>
                      <strong>Allowed Uses:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {district.allowedUses.map((use, index) => (
                          <li key={index}>{use}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Bulk Rules:</strong>
                      <div className="mt-1 space-y-1">
                        <div>Max Height: {district.bulkRules.maxHeight}</div>
                        <div>FAR: {district.bulkRules.farRatio}</div>
                        <div>Lot Coverage: {district.bulkRules.lotCoverage}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
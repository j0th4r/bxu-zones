import React, { useState } from 'react';
import {X, Building, MapPin, Info, Loader2, Phone, RefreshCw} from 'lucide-react';
import {Parcel} from '../types/zoning';
import { SuppliersResponse } from '../types/zoning';
import { StreetViewPreview } from './StreetViewPreview';
import { StreetViewModal } from './StreetViewModal';

interface ParcelPopupProps {
  parcel: Parcel | null;
  onClose: () => void;
  contextQuery?: string;
  supplierData?: SuppliersResponse | null;
  loadingSuppliers?: boolean;
  onRefreshSuppliers?: () => void;
}

export const ParcelPopup: React.FC<ParcelPopupProps> = ({
  parcel, 
  onClose, 
  contextQuery: _contextQuery = '', // Used for future AI-powered context features 
  supplierData, 
  loadingSuppliers = false, 
  onRefreshSuppliers
}) => {
  const [isStreetViewModalOpen, setIsStreetViewModalOpen] = useState(false);

  if (!parcel) return null;

  const isZoningArea = !parcel.geometry; // No point geometry means zoning polygon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{isZoningArea ? 'Zoning Details' : 'Parcel Details'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <MapPin size={16} className="text-blue-400" />
            <span className="font-semibold">{parcel.address}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-400">Zone ID</label>
              <p className="text-white">{parcel.id}</p>
            </div>
            <div>
              <label className="text-gray-400">Zone Type</label>
              <p className="text-white font-semibold">{parcel.zoneId}</p>
            </div>
            <div className="col-span-2">
              <label className="text-gray-400">Zone Name</label>
              <p className="text-white">
                {parcel.attributes.ZONE_NAME || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-2">Description</label>
            <p className="text-white text-sm">
              {parcel.attributes.DESCRIPTION || 'No description available'}
            </p>
          </div>          {parcel.attributes.regulations && (
            <div>
              <label className="text-gray-400 block mb-2">Regulations</label>
              <div className="flex items-start space-x-2">
                <Building size={14} className="text-green-400 mt-1" />
                <span className="text-white text-sm">
                  {parcel.attributes.regulations}
                </span>
              </div>
            </div>
          )}

          {/* Street View Preview - hide for zoning areas */}
          {!isZoningArea && (
            <StreetViewPreview
              address={parcel.address}
              lat={parcel.geometry?.coordinates[1]}
              lng={parcel.geometry?.coordinates[0]}
              onPreviewClick={() => setIsStreetViewModalOpen(true)}
            />
          )}

          {/* Supplier info section - hide for zoning areas */}
          {!isZoningArea && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400">Nearest Suppliers</label>
              {onRefreshSuppliers && (
                <button
                  onClick={onRefreshSuppliers}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Refresh suppliers"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
            {loadingSuppliers ? (
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Loader2 className="animate-spin" size={16} />
                <span>Fetching supplier information...</span>
              </div>
            ) : supplierData && supplierData.suppliers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-3">
                {supplierData.suppliers.map((supplier, index) => (
                  <div key={index} className="p-3 bg-gray-700/50 rounded border-l-2 border-yellow-400">
                    <div className="space-y-1 text-white text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-yellow-400" />
                        <span className="font-semibold">{supplier.name}</span>
                      </div>
                      <p className="text-gray-300">Business: {supplier.business}</p>
                      <p className="text-gray-300">
                        Phone: <a href={`tel:${supplier.phone.replace(/\s+/g, '')}`} className="text-blue-300 underline">{supplier.phone}</a>
                      </p>
                      <p className="text-gray-300">Address: {supplier.address}</p>
                      <p className="text-gray-400 text-xs">Distance: {supplier.distance_km.toFixed(1)} km</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No supplier data available.</p>
            )}
          </div>
          )}          <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
            <Info size={14} />
            <span>
              Zone Classification:{' '}
              {parcel.attributes.ZONE_TYPE || parcel.zoneId}
            </span>
          </div>
        </div>
      </div>

      {/* Street View Modal */}
      <StreetViewModal
        isOpen={isStreetViewModalOpen}
        onClose={() => setIsStreetViewModalOpen(false)}
        address={parcel.address}
        lat={parcel.geometry?.coordinates[1]}
        lng={parcel.geometry?.coordinates[0]}
      />
    </div>
  );
};

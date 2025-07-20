import React from 'react';
import {X, Building, MapPin, Info, Loader2, Phone} from 'lucide-react';
import {Parcel} from '../types/zoning';
import { SupplierInfo } from '../types/zoning';
import { ZoningAPI } from '../utils/api';

interface ParcelPopupProps {
  parcel: Parcel | null;
  onClose: () => void;
  contextQuery?: string;
}

export const ParcelPopup: React.FC<ParcelPopupProps> = ({parcel, onClose, contextQuery = ''}) => {
  const [supplier, setSupplier] = React.useState<SupplierInfo | null>(null);
  const [loadingSupplier, setLoadingSupplier] = React.useState(false);

  // Fetch supplier info whenever a new parcel is selected
  React.useEffect(() => {
    let cancelled = false;
    const fetchSupplier = async () => {
      if (!parcel) return;
      setLoadingSupplier(true);
      setSupplier(null);
      try {
        const info = await ZoningAPI.getNearestSuppliers(parcel.address, contextQuery);
        if (!cancelled) {
          setSupplier(info);
        }
      } catch (err) {
        console.error('Supplier lookup error:', err);
      } finally {
        if (!cancelled) setLoadingSupplier(false);
      }
    };
    fetchSupplier();

    return () => {
      cancelled = true;
    };
  }, [parcel]);

  if (!parcel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Parcel Details</h2>
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
          </div>

          {parcel.attributes.regulations && (
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

          {/* Supplier info section */}
          <div className="pt-4 border-t border-gray-700">
            <label className="text-gray-400 block mb-2">Nearest Supplier Contact</label>
            {loadingSupplier ? (
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Loader2 className="animate-spin" size={16} />
                <span>Fetching supplier information...</span>
              </div>
            ) : supplier ? (
              <div className="space-y-1 text-white text-sm">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-yellow-400" />
                  <span className="font-semibold">{supplier.name}</span>
                </div>
                <p>Business: {supplier.business}</p>
                <p>Phone: <a href={`tel:${supplier.phone.replace(/\s+/g, '')}`} className="underline">{supplier.phone}</a></p>
                <p>Address: {supplier.address}</p>
                <p>Approx. Distance: {supplier.distance_km.toFixed(1)} km</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No supplier data available.</p>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
            <Info size={14} />
            <span>
              Zone Classification:{' '}
              {parcel.attributes.ZONE_TYPE || parcel.zoneId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

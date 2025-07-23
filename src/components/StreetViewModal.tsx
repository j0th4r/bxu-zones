import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, AlertCircle } from 'lucide-react';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  lat?: number;
  lng?: number;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  address,
  lat,
  lng
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [streetViewAvailable, setStreetViewAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !streetViewRef.current || !window.google) return;

    const initializeStreetView = () => {
      setIsLoading(true);
      
      const streetViewService = new window.google.maps.StreetViewService();
      const position = lat && lng ? { lat, lng } : null;

      if (position) {
        // Check if street view is available at this location
        streetViewService.getPanorama({
          location: position,
          radius: 100,
          source: window.google.maps.StreetViewSource.OUTDOOR        }, (data, status) => {
          if (status === 'OK' && data && streetViewRef.current) {
            panoramaRef.current = new window.google.maps.StreetViewPanorama(
              streetViewRef.current,
              {
                position: data.location?.latLng,
                pov: {
                  heading: 0,
                  pitch: 0
                },
                zoom: 1,
                addressControl: true,
                linksControl: true,
                panControl: true,
                enableCloseButton: false,
                fullscreenControl: true,
                motionTracking: false,
                motionTrackingControl: false
              }
            );
            setStreetViewAvailable(true);
          } else {
            setStreetViewAvailable(false);
          }
          setIsLoading(false);
        });
      } else {
        // Geocode the address first
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0] && streetViewRef.current) {
            const location = results[0].geometry.location;
            
            streetViewService.getPanorama({
              location: location,
              radius: 100,
              source: window.google.maps.StreetViewSource.OUTDOOR            }, (data, streetViewStatus) => {
              if (streetViewStatus === 'OK' && data && streetViewRef.current) {
                panoramaRef.current = new window.google.maps.StreetViewPanorama(
                  streetViewRef.current,
                  {
                    position: data.location?.latLng,
                    pov: {
                      heading: 0,
                      pitch: 0
                    },
                    zoom: 1,
                    addressControl: true,
                    linksControl: true,
                    panControl: true,
                    enableCloseButton: false,
                    fullscreenControl: true,
                    motionTracking: false,
                    motionTrackingControl: false
                  }
                );
                setStreetViewAvailable(true);
              } else {
                setStreetViewAvailable(false);
              }
              setIsLoading(false);
            });
          } else {
            setStreetViewAvailable(false);
            setIsLoading(false);
          }
        });
      }
    };

    // Add a small delay to ensure the modal is fully rendered
    const timer = setTimeout(initializeStreetView, 100);
    return () => clearTimeout(timer);
  }, [isOpen, address, lat, lng]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <MapPin size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Street View</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Address */}
        <div className="px-4 py-2 border-b border-gray-700">
          <p className="text-gray-300 text-sm">{address}</p>
        </div>

        {/* Street View Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-gray-300">Loading Street View...</p>
              </div>
            </div>
          )}
          
          {!streetViewAvailable && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Street View Not Available</h3>
                <p className="text-gray-300">
                  Street View imagery is not available for this location.
                </p>
              </div>
            </div>
          )}
          
          <div 
            ref={streetViewRef} 
            className="w-full h-full rounded-b-lg"
            style={{ display: streetViewAvailable ? 'block' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

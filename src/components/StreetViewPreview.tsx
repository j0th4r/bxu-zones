import React, { useEffect, useRef, useState } from 'react';
import { Eye, AlertCircle } from 'lucide-react';

interface StreetViewPreviewProps {
  address: string;
  lat?: number;
  lng?: number;
  onPreviewClick: () => void;
}

export const StreetViewPreview: React.FC<StreetViewPreviewProps> = ({
  address,
  lat,
  lng,
  onPreviewClick
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [streetViewAvailable, setStreetViewAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!previewRef.current || !window.google) return;

    const initializePreview = () => {
      setIsLoading(true);
      
      const streetViewService = new window.google.maps.StreetViewService();
      const position = lat && lng ? { lat, lng } : null;

      if (position) {
        // Check if street view is available at this location
        streetViewService.getPanorama({
          location: position,
          radius: 100,
          source: window.google.maps.StreetViewSource.OUTDOOR        }, (data, status) => {
          if (status === 'OK' && data && previewRef.current) {
            panoramaRef.current = new window.google.maps.StreetViewPanorama(
              previewRef.current,
              {
                position: data.location?.latLng,
                pov: {
                  heading: 0,
                  pitch: 0
                },
                zoom: 0,
                addressControl: false,
                linksControl: false,
                panControl: false,
                enableCloseButton: false,
                fullscreenControl: false,
                motionTracking: false,
                motionTrackingControl: false,
                clickToGo: false,
                scrollwheel: false,
                disableDefaultUI: true
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
          if (status === 'OK' && results && results[0] && previewRef.current) {
            const location = results[0].geometry.location;
            
            streetViewService.getPanorama({
              location: location,
              radius: 100,
              source: window.google.maps.StreetViewSource.OUTDOOR            }, (data, streetViewStatus) => {
              if (streetViewStatus === 'OK' && data && previewRef.current) {
                panoramaRef.current = new window.google.maps.StreetViewPanorama(
                  previewRef.current,
                  {
                    position: data.location?.latLng,
                    pov: {
                      heading: 0,
                      pitch: 0
                    },
                    zoom: 0,
                    addressControl: false,
                    linksControl: false,
                    panControl: false,
                    enableCloseButton: false,
                    fullscreenControl: false,
                    motionTracking: false,
                    motionTrackingControl: false,
                    clickToGo: false,
                    scrollwheel: false,
                    disableDefaultUI: true
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

    // Add a small delay to ensure the component is fully rendered
    const timer = setTimeout(initializePreview, 100);
    return () => clearTimeout(timer);
  }, [address, lat, lng]);

  return (
    <div className="space-y-2">
      <label className="text-gray-400 block">Street View</label>
      <div 
        className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden cursor-pointer group hover:bg-gray-600 transition-colors"
        onClick={onPreviewClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-1"></div>
              <p className="text-gray-400 text-xs">Loading...</p>
            </div>
          </div>
        )}
        
        {!streetViewAvailable && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle size={24} className="text-yellow-400 mx-auto mb-1" />
              <p className="text-gray-400 text-xs">Street View Not Available</p>
            </div>
          </div>
        )}
        
        {streetViewAvailable && (
          <>
            <div 
              ref={previewRef} 
              className="w-full h-full"
              style={{ display: isLoading ? 'none' : 'block' }}
            />
            
            {/* Overlay for click interaction */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-75 rounded-full p-3">
                <Eye size={20} className="text-white" />
              </div>
            </div>
            
            {/* Click hint */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              Click to expand
            </div>
          </>
        )}
      </div>
    </div>
  );
};

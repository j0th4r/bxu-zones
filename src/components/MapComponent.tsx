import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {ZoningDistrict, Parcel} from '../types/zoning';
import {ZoningAPI} from '../utils/api';
import {AZURE_MAPS_CONFIG} from '../config/azure-maps';
import {getZoneColor, BUTUAN_COORDINATES} from '../config/zoning-colors';

// TypeScript declaration for Azure Maps global object
declare global {
  interface Window {
    atlas: any;
  }
}

interface MapComponentProps {
  onParcelClick: (parcel: Parcel) => void;
  searchResults?: any;
  className?: string;
  subscriptionKey: string; // Azure Maps subscription key
  layerVisibility?: Record<string, boolean>;
  activeMeasurementTool?: string | null;
  currentMapStyle?: string;
  centerCoordinates?: [number, number] | null;
}

export const MapComponent = forwardRef<MapComponentRef, MapComponentProps>( ({
  onParcelClick,
  searchResults,
  className = '',
  subscriptionKey,
  layerVisibility = {},
  activeMeasurementTool,
  currentMapStyle = 'road',
  centerCoordinates = null,
}: MapComponentProps, ref) => {
  const [zoningDistricts, setZoningDistricts] = useState<ZoningDistrict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const dataSource = useRef<any>(null);
  const polygonLayer = useRef<any>(null);
  const searchDataSource = useRef<any>(null);
  const searchSymbolLayer = useRef<any>(null);

  useEffect(() => {
    loadZoningData();
  }, []);

  useEffect(() => {
    // Wait for Azure Maps to be loaded
    const checkAtlas = () => {
      if (window.atlas && mapRef.current) {
        initializeMap();
      } else {
        setTimeout(checkAtlas, 100);
      }
    };
    checkAtlas();

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
      }
    };
  }, [subscriptionKey, mapReady]);

  // Handle layer visibility changes
  useEffect(() => {
    if (polygonLayer.current && mapInstance.current) {
      const isZoningVisible = layerVisibility['Zoning Districts'] !== false;
      mapInstance.current.layers.setOptions(polygonLayer.current, {
        visible: isZoningVisible,
      });
    }
  }, [layerVisibility]);

  // Handle map style changes
  useEffect(() => {
    if (mapInstance.current && currentMapStyle) {
      const styleConfig =
        AZURE_MAPS_CONFIG.mapStyles[
          currentMapStyle as keyof typeof AZURE_MAPS_CONFIG.mapStyles
        ];
      if (styleConfig) {
        mapInstance.current.setStyle({
          style: styleConfig.style,
        });
      }
    }
  }, [currentMapStyle]);

  // Center map when centerCoordinates changes
  useEffect(() => {
    if (mapInstance.current && centerCoordinates) {
      mapInstance.current.setCamera({
        center: centerCoordinates,
        zoom: 16,
        duration: 800,
      });
    }
  }, [centerCoordinates]);

  // Handle search results with coordinates
  useEffect(() => {
    if (mapInstance.current && searchDataSource.current && searchResults) {
      // Clear previous search markers
      searchDataSource.current.clear();

      // Add markers for parcels with coordinates
      const features = searchResults.results.parcels
        .filter(
          (parcel: Parcel) => parcel.geometry && parcel.geometry.coordinates
        )
        .map((parcel: Parcel) => ({
          type: 'Feature',
          geometry: parcel.geometry,
          properties: {
            id: parcel.id,
            address: parcel.address,
            zoneType: parcel.zoneId,
            relevance: parcel.attributes.relevance,
            source: parcel.attributes.source,
          },
        }));

      if (features.length > 0) {
        searchDataSource.current.add(features);

        // Zoom to show all search results
        const bounds = new window.atlas.data.BoundingBox.fromData(features);
        mapInstance.current.setCamera({
          bounds: bounds,
          padding: 50,
          duration: 1000,
        });
      }
    }
  }, [searchResults]);

  // expose zoom methods to parent
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapInstance.current) {
        mapInstance.current.setCamera({
          zoom: mapInstance.current.getCamera().zoom + 1,
          duration: 300,
        });
      }
    },
    zoomOut: () => {
      if (mapInstance.current) {
        mapInstance.current.setCamera({
          zoom: mapInstance.current.getCamera().zoom - 1,
          duration: 300,
        });
      }
    }
  }));

  const initializeMap = () => {
    if (mapRef.current && subscriptionKey && window.atlas) {
      const atlas = window.atlas;

      // Initialize the map
      mapInstance.current = new atlas.Map(mapRef.current, {
        center: BUTUAN_COORDINATES.center, // Butuan City coordinates
        zoom: 14,
        view: 'Auto',
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: subscriptionKey,
        },
        style: 'road', // You can change this to 'satellite', 'hybrid', etc.
      });

      // Wait for the map to be ready
      mapInstance.current.events.add('ready', () => {
        if (mapInstance.current) {
          // Create a data source for zoning polygons
          dataSource.current = new atlas.source.DataSource();
          mapInstance.current.sources.add(dataSource.current);

          // Create a data source for search result markers
          searchDataSource.current = new atlas.source.DataSource();
          mapInstance.current.sources.add(searchDataSource.current);

          // Add polygon layer for zoning areas with standardized colors
          polygonLayer.current = new atlas.layer.PolygonLayer(
            dataSource.current,
            null,
            {
              fillColor: [
                'case',
                // Standardized zoning colors matching legend
                ['==', ['get', 'zoneType'], 'R-1'],
                getZoneColor('R-1'), // Residential
                ['==', ['get', 'zoneType'], 'C-1'],
                getZoneColor('C-1'), // Commercial
                ['==', ['get', 'zoneType'], 'MU'],
                getZoneColor('MU'), // Mixed Use
                ['==', ['get', 'zoneType'], 'I-1'],
                getZoneColor('I-1'), // Industrial
                ['==', ['get', 'zoneType'], 'OS'],
                getZoneColor('OS'), // Open Space

                '#64748b', // Default gray for unmapped zones
              ],
              fillOpacity: 0.3,
              strokeColor: '#ffffff',
              strokeWidth: 1,
            }
          );

          mapInstance.current.layers.add(polygonLayer.current);

          // Add symbol layer for search result markers
          searchSymbolLayer.current = new atlas.layer.SymbolLayer(
            searchDataSource.current,
            null,
            {
              iconOptions: {
                image: 'pin-round-red',
                anchor: 'center',
                allowOverlap: true,
                size: 1.2,
              },
              textOptions: {
                textField: ['get', 'address'],
                color: 'white',
                offset: [0, -2],
                size: 12,
                haloColor: 'black',
                haloWidth: 2,
              },
            }
          );

          mapInstance.current.layers.add(searchSymbolLayer.current);

          // Add click event for search markers
          mapInstance.current.events.add(
            'click',
            searchSymbolLayer.current,
            (e: any) => {
              if (e.shapes && e.shapes.length > 0) {
                const shape = e.shapes[0];

                // Support both atlas.Shape instances and raw GeoJSON features
                const getShapeProperties = () =>
                  typeof (shape as any).getProperties === 'function'
                    ? (shape as any).getProperties()
                    : (shape as any).properties || {};

                const getShapeGeometry = () =>
                  typeof (shape as any).getGeometry === 'function'
                    ? (shape as any).getGeometry()
                    : (shape as any).geometry || null;

                const properties = getShapeProperties();

                const searchParcel: Parcel = {
                  id: properties.id || 'search-result',
                  address: properties.address || 'Search Result',
                  zoneId: properties.zoneType || 'AI Search',
                  geometry: getShapeGeometry(),
                  attributes: {
                    relevance: properties.relevance || 'AI search result',
                    source: properties.source || 'AI Analysis',
                    ZONE_TYPE: properties.zoneType || 'AI Search',
                  },
                };
                onParcelClick(searchParcel);
              }
            }
          );

          // Add click event for polygons
          mapInstance.current.events.add(
            'click',
            polygonLayer.current,
            (e: any) => {
              if (e.shapes && e.shapes.length > 0) {
                const shape = e.shapes[0];

                const getShapeProperties = () =>
                  typeof (shape as any).getProperties === 'function'
                    ? (shape as any).getProperties()
                    : (shape as any).properties || {};

                const properties = getShapeProperties();

                const mockParcel: Parcel = {
                  id: properties.id || 'unknown',
                  address: properties.address || 'Unknown Address',
                  zoneId: properties.zoneType || 'Unknown',
                  geometry: null,
                  attributes: {
                    OBJECTID: properties.objectId || 0,
                    ZONE_NAME: properties.zoneName || 'Unknown Zone',
                    ZONE_TYPE: properties.zoneType || 'Unknown',
                    DESCRIPTION: properties.description || 'No description',
                    ADDRESS: properties.address || 'Unknown Address',
                  },
                };
                onParcelClick(mockParcel);
              }
            }
          );

          // Add sample zoning polygons
          addSampleZoningAreas();

          setIsLoading(false);
          setMapReady(true);
        }
      });
    }
  };

  const addSampleZoningAreas = () => {
    if (dataSource.current && window.atlas) {
      // Define accurate zoning areas in Butuan City with standardized zone types
      const zoningAreas = [
        // RESIDENTIAL ZONES (R-1)
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.52098448844048, 8.943387400695183],
                [125.524353343076, 8.943853729963644],
                [125.52538895047472, 8.93833131506232],
                [125.53286143978636, 8.939927013713287],
                [125.54006968184862, 8.921349808513076],
                [125.52206122876693, 8.921643150966162],
                [125.52098448844048, 8.943387400695183],
              ],
            ],
          },
          properties: {
            id: 'r1-001',
            zoneType: 'R-1',
            zoneName: 'Residential Zone - Villa Kananga',
            description: 'Single and multi-family residential development',
            address: 'Villa Kananga Subdivision, Butuan City',
            regulations: 'Max height: 15 meters, FAR: 2.5, Lot coverage: 70%',
            objectId: 1,
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.528, 8.952],
                [125.531, 8.9522],
                [125.5315, 8.9518],
                [125.5317, 8.9513],
                [125.5314, 8.9508],
                [125.5308, 8.9505],
                [125.5302, 8.9506],
                [125.5295, 8.9509],
                [125.529, 8.9513],
                [125.5288, 8.9518],
                [125.528, 8.952],
              ],
            ],
          },
          properties: {
            id: 'r1-002',
            zoneType: 'R-1',
            zoneName: 'Residential Zone - Banza District',
            description: 'Family residential area with modern amenities',
            address: 'Banza District, Butuan City',
            regulations: 'Max height: 15 meters, FAR: 2.5, Lot coverage: 70%',
            objectId: 2,
          },
        },

        // COMMERCIAL ZONES (C-1)
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.542, 8.953],
                [125.5445, 8.9532],
                [125.545, 8.9528],
                [125.5452, 8.9523],
                [125.5449, 8.9518],
                [125.5444, 8.9515],
                [125.5438, 8.9516],
                [125.5432, 8.9519],
                [125.5428, 8.9523],
                [125.5427, 8.9528],
                [125.542, 8.953],
              ],
            ],
          },
          properties: {
            id: 'c1-001',
            zoneType: 'C-1',
            zoneName: 'Commercial Zone - J.C. Aquino Avenue',
            description: 'Main commercial strip with retail and offices',
            address: 'J.C. Aquino Avenue, Butuan City',
            regulations: 'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
            objectId: 3,
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.545, 8.95],
                [125.5475, 8.9502],
                [125.548, 8.9498],
                [125.5482, 8.9493],
                [125.5479, 8.9488],
                [125.5474, 8.9485],
                [125.5468, 8.9486],
                [125.5462, 8.9489],
                [125.5458, 8.9493],
                [125.5457, 8.9498],
                [125.545, 8.95],
              ],
            ],
          },
          properties: {
            id: 'c1-002',
            zoneType: 'C-1',
            zoneName: 'Commercial Zone - Downtown Center',
            description: 'Central business and shopping district',
            address: 'Downtown Center, Butuan City',
            regulations: 'Max height: 25 meters, FAR: 4.0, Lot coverage: 80%',
            objectId: 4,
          },
        },

        // MIXED USE ZONES (MU)
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.539, 8.952],
                [125.5415, 8.9522],
                [125.542, 8.9518],
                [125.5422, 8.9513],
                [125.5419, 8.9508],
                [125.5414, 8.9505],
                [125.5408, 8.9506],
                [125.5402, 8.9509],
                [125.5398, 8.9513],
                [125.5397, 8.9518],
                [125.539, 8.952],
              ],
            ],
          },
          properties: {
            id: 'mu-001',
            zoneType: 'MU',
            zoneName: 'Mixed Use Zone - Poblacion Heritage',
            description: 'Historic mixed use with residential and commercial',
            address: 'Poblacion Heritage District, Butuan City',
            regulations: 'Max height: 20 meters, FAR: 3.5, Lot coverage: 70%',
            objectId: 5,
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.548, 8.9545],
                [125.5505, 8.9547],
                [125.551, 8.9543],
                [125.5512, 8.9538],
                [125.5509, 8.9533],
                [125.5504, 8.953],
                [125.5498, 8.9531],
                [125.5492, 8.9534],
                [125.5488, 8.9538],
                [125.5487, 8.9543],
                [125.548, 8.9545],
              ],
            ],
          },
          properties: {
            id: 'mu-002',
            zoneType: 'MU',
            zoneName: 'Mixed Use Zone - Golden Ribbon',
            description: 'Modern mixed development with live-work spaces',
            address: 'Golden Ribbon District, Butuan City',
            regulations: 'Max height: 20 meters, FAR: 3.5, Lot coverage: 70%',
            objectId: 6,
          },
        },

        // INDUSTRIAL ZONES (I-1)
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.475, 8.948],
                [125.478, 8.9482],
                [125.479, 8.9478],
                [125.4792, 8.9472],
                [125.4789, 8.9466],
                [125.4783, 8.9462],
                [125.4775, 8.946],
                [125.4765, 8.9462],
                [125.4758, 8.9466],
                [125.4756, 8.9472],
                [125.475, 8.9478],
                [125.475, 8.948],
              ],
            ],
          },
          properties: {
            id: 'i1-001',
            zoneType: 'I-1',
            zoneName: 'Industrial Zone - Bancasi Area',
            description: 'Light industrial and logistics facilities',
            address: 'Bancasi Industrial Area, Butuan City',
            regulations: 'Max height: 18 meters, FAR: 2.5, Lot coverage: 75%',
            objectId: 7,
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.555, 8.945],
                [125.558, 8.9452],
                [125.559, 8.9448],
                [125.5592, 8.9442],
                [125.5589, 8.9436],
                [125.5583, 8.9432],
                [125.5575, 8.943],
                [125.5565, 8.9432],
                [125.5558, 8.9436],
                [125.5556, 8.9442],
                [125.555, 8.9448],
                [125.555, 8.945],
              ],
            ],
          },
          properties: {
            id: 'i1-002',
            zoneType: 'I-1',
            zoneName: 'Industrial Zone - Eastern District',
            description: 'Manufacturing and processing facilities',
            address: 'Eastern Industrial District, Butuan City',
            regulations: 'Max height: 18 meters, FAR: 2.5, Lot coverage: 75%',
            objectId: 8,
          },
        },

        // OPEN SPACE ZONES (OS)
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.543, 8.956],
                [125.5455, 8.9562],
                [125.546, 8.9558],
                [125.5462, 8.9553],
                [125.5459, 8.9548],
                [125.5454, 8.9545],
                [125.5448, 8.9546],
                [125.5442, 8.9549],
                [125.5438, 8.9553],
                [125.5437, 8.9558],
                [125.543, 8.956],
              ],
            ],
          },
          properties: {
            id: 'os-001',
            zoneType: 'OS',
            zoneName: 'Open Space - Magsaysay Park',
            description: 'Public park and recreational facilities',
            address: 'Magsaysay Park, Butuan City',
            regulations: 'Max height: 10 meters, FAR: 0.5, Lot coverage: 15%',
            objectId: 9,
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [125.532, 8.958],
                [125.535, 8.9583],
                [125.5365, 8.9581],
                [125.5375, 8.9578],
                [125.5378, 8.9573],
                [125.5375, 8.9568],
                [125.5368, 8.9565],
                [125.5358, 8.9564],
                [125.5348, 8.9566],
                [125.5338, 8.9569],
                [125.533, 8.9573],
                [125.5327, 8.9578],
                [125.532, 8.958],
              ],
            ],
          },
          properties: {
            id: 'os-002',
            zoneType: 'OS',
            zoneName: 'Open Space - Agusan River Buffer',
            description: 'Protected environmental zone along the river',
            address: 'Agusan River Buffer Zone, Butuan City',
            regulations: 'Max height: 10 meters, FAR: 0.5, Lot coverage: 15%',
            objectId: 10,
          },
        },
      ];

      // Add all zoning areas to the data source
      dataSource.current.add(zoningAreas);
    }
  };

  const loadZoningData = async () => {
    try {
      const districts = await ZoningAPI.getZoningDistricts();
      setZoningDistricts(districts);
    } catch (error) {
      console.error('Error loading zoning data:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Azure Maps container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{minHeight: '400px'}}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading map data...</p>
          </div>
        </div>
      )}

      {!window.atlas && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading Azure Maps...</p>
          </div>
        </div>
      )}
    </div>
  );
});

export type MapComponentRef = {
  zoomIn: () => void;
  zoomOut: () => void;
};

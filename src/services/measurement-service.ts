/**
 * Measurement Service
 * Provides utilities for calculating geographic distances
 */

// Earth radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * Math.PI / 180;
};

/**
 * Calculate the great-circle distance between two points using the Haversine formula
 * @param lat1 - Latitude of first point in degrees
 * @param lng1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lng2 - Longitude of second point in degrees
 * @returns Distance in meters
 */
export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Convert latitude and longitude from degrees to radians
  const radLat1 = degreesToRadians(lat1);
  const radLng1 = degreesToRadians(lng1);
  const radLat2 = degreesToRadians(lat2);
  const radLng2 = degreesToRadians(lng2);

  // Calculate differences in coordinates
  const deltaLat = radLat2 - radLat1;
  const deltaLng = radLng2 - radLng1;

  // Haversine formula
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS * c;
};

/**
 * Format distance in human-readable format
 * @param distanceInMeters - Distance in meters
 * @param useImperial - Whether to use imperial units (miles, feet)
 * @returns Formatted distance string
 */
export const formatDistance = (distanceInMeters: number, useImperial = false): string => {
  if (useImperial) {
    // Convert to miles
    const distanceInMiles = distanceInMeters / 1609.344;
    
    if (distanceInMiles < 0.1) {
      // Display in feet if less than 0.1 miles
      const distanceInFeet = distanceInMeters * 3.28084;
      return `${distanceInFeet.toFixed(1)} ft`;
    } else {
      return `${distanceInMiles.toFixed(2)} mi`;
    }
  } else {
    // Metric units
    if (distanceInMeters >= 1000) {
      // Display in kilometers if 1000 meters or more
      const distanceInKm = distanceInMeters / 1000;
      return `${distanceInKm.toFixed(2)} km`;
    } else {
      return `${Math.round(distanceInMeters)} m`;
    }
  }
};

/**
 * Calculate total distance along a path of coordinates
 * @param coordinates - Array of [lat, lng] coordinates
 * @returns Total distance in meters
 */
export const calculatePathDistance = (coordinates: [number, number][]): number => {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lng1] = coordinates[i];
    const [lat2, lng2] = coordinates[i + 1];
    
    totalDistance += calculateHaversineDistance(lat1, lng1, lat2, lng2);
  }
  
  return totalDistance;
};

/**
 * Calculate segment distances for ruler-like display
 * @param coordinates - Array of [lat, lng] coordinates
 * @returns Array of objects with segment info
 */
export const calculateSegmentDistances = (coordinates: [number, number][]): Array<{
  segmentIndex: number;
  segmentDistance: number;
  cumulativeDistance: number;
  startPoint: [number, number];
  endPoint: [number, number];
  midPoint: [number, number];
}> => {
  if (coordinates.length < 2) return [];

  const segments = [];
  let cumulativeDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lng1] = coordinates[i];
    const [lat2, lng2] = coordinates[i + 1];
    
    const segmentDistance = calculateHaversineDistance(lat1, lng1, lat2, lng2);
    cumulativeDistance += segmentDistance;
    
    // Calculate midpoint for label placement
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;
    
    segments.push({
      segmentIndex: i,
      segmentDistance,
      cumulativeDistance,
      startPoint: [lat1, lng1] as [number, number],
      endPoint: [lat2, lng2] as [number, number],
      midPoint: [midLat, midLng] as [number, number]
    });
  }
  
  return segments;
};

/**
 * Format distance for ruler display (always show meters with 2 decimal places)
 * @param distanceInMeters - Distance in meters
 * @returns Formatted distance string for ruler
 */
export const formatRulerDistance = (distanceInMeters: number): string => {
  if (distanceInMeters >= 1000) {
    const distanceInKm = distanceInMeters / 1000;
    return `${distanceInKm.toFixed(2)} km`;
  } else {
    return `${distanceInMeters.toFixed(2)} m`;
  }
};

export default {
  calculateHaversineDistance,
  calculatePathDistance,
  calculateSegmentDistances,
  formatDistance,
  formatRulerDistance
};

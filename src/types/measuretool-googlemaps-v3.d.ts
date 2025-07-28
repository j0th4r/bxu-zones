// Type definitions for measuretool-googlemaps-v3
declare module 'measuretool-googlemaps-v3' {
  export interface MeasureToolOptions {
    showSegmentLength?: boolean;
    tooltip?: boolean;
    unit?: 'metric' | 'imperial';
    contextMenu?: boolean;
  }

  export interface MeasureToolResult {
    length: number;
    area?: number;
    coordinates: google.maps.LatLng[];
  }

  export default class MeasureTool {
    constructor(map: google.maps.Map, options?: MeasureToolOptions);
    
    start(): void;
    end(): void;
    addListener(event: string, callback: (result: MeasureToolResult) => void): void;
    removeListener(event: string, callback: Function): void;
    setUnit(unit: 'metric' | 'imperial'): void;
    clear(): void;
    destroy(): void;
  }
}

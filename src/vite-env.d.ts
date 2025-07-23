/// <reference types="vite/client" />

// Google Maps API types
declare global {
  interface Window {
    google: typeof google;
  }
}

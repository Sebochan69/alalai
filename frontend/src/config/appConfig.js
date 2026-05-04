export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || "AlalAI",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
  map: {
    defaultLat: Number(import.meta.env.VITE_DEFAULT_BARANGAY_LAT || 14.5995),
    defaultLng: Number(import.meta.env.VITE_DEFAULT_BARANGAY_LNG || 120.9842),
    defaultZoom: Number(import.meta.env.VITE_DEFAULT_MAP_ZOOM || 15),
  },
};

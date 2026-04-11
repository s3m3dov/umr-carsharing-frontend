// pages/TestMapPage.tsx
import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function TestMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    // Load the Google Maps API script
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstance) {
        mapInstance.setCenter({ lat: 0, lng: 0 });
        mapInstance.setZoom(2);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && mapRef.current) {
      if (!mapInstance) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.2090 },
          zoom: 10,
        });
        setMapInstance(map);
      }
    }
  }, [isLoaded, mapInstance]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div ref={mapRef} className="w-full h-full max-w-4xl max-h-800" />
    </div>
  );
}
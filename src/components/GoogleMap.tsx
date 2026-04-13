
import React, { useEffect, useRef, useState } from 'react';

interface RouteGeometry {
  type: string;
  coordinates: number[][];
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
  }>;
  routeGeometry?: RouteGeometry | null;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function GoogleMap({
  center = { lat: 0, lng: 0 },
  zoom = 2,
  markers = [],
  routeGeometry,
  className = "w-full h-64"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeMap = async () => {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        createMap();
        return;
      }

      // Prevent multiple script loads
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script is already loading, wait for it
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
            createMap();
            clearInterval(checkLoaded);
          }
        }, 100);
        return;
      }

      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
        createMap();
      };

      script.onerror = () => {
        setError('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    };

    const createMap = () => {
      if (mapRef.current && !mapInstanceRef.current && window.google) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }
    };

    initializeMap();
  }, []);

  // Render markers and fit bounds
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      markers.forEach(markerData => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: mapInstanceRef.current,
          title: markerData.title,
        });

        if (markerData.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.info,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        }

        markersRef.current.push(marker);
      });

      // Adjust map bounds to include markers and polyline points
      const hasRoute = routeGeometry?.type === 'LineString' && routeGeometry.coordinates.length >= 2;
      if (markers.length > 0 || hasRoute) {
        const bounds = new window.google.maps.LatLngBounds();
        
        if (markers.length > 0) {
          markers.forEach(markerData => bounds.extend(markerData.position));
        }

        if (hasRoute) {
          routeGeometry!.coordinates.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
        }

        mapInstanceRef.current.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        });
      }
    }
  }, [markers, isLoaded, routeGeometry]);

  // Render polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (routeGeometry?.type === 'LineString' && routeGeometry.coordinates.length >= 2) {
      const path = routeGeometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      polylineRef.current = new window.google.maps.Polyline({
        path,
        map: mapInstanceRef.current,
        geodesic: true,
        strokeColor: '#2563eb',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      });
    }
  }, [routeGeometry, isLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      // If we have markers or route, fitBounds will handle the view.
      // Only manually set center/zoom if no data is provided or if they were explicitly changed from defaults.
      const hasData = markers.length > 0 || (routeGeometry?.type === 'LineString' && routeGeometry.coordinates.length >= 2);
      
      if (!hasData || (center.lat !== 0 || center.lng !== 0 || zoom !== 2)) {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [center, zoom, isLoaded, markers.length, routeGeometry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <div className={`${className} relative`}>
      <div ref={mapRef} className="w-full h-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
          <div className="text-red-500 text-sm text-center p-4">{error}</div>
        </div>
      )}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
          <div className="text-gray-500 text-sm">Loading map...</div>
        </div>
      )}
    </div>
  );
}

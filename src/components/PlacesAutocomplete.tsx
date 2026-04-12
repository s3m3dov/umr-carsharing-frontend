import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  countries?: string | string[];
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function PlacesAutocomplete({
                                             value,
                                             onChange,
                                             placeholder,
                                             className,
                                             id,
                                             required,
                                             countries
                                           }: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Prevent multiple script loads
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script is already loading, wait for it
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
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
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Clean up interval if component unmounts
      // No interval to clear in this return function since it's created in a different code path
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
        ...(countries ? { componentRestrictions: { country: countries } } : {})
      });

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (place && place.geometry && place.geometry.location) {
          // Extract lat/lng and address
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || inputRef.current?.value || '';

          // Pass values to parent component
          onChange(address, lat, lng);
        }
      });
    }
  }, [isLoaded, onChange, countries]);

  // Handle direct input changes (when typing but not selecting from dropdown)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just update the visible value
    onChange(e.target.value);
  };

  if (error) {
    return (
        <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
          {error}
        </div>
    );
  }

  return (
      <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(className)}
          required={required}
      />
  );
}
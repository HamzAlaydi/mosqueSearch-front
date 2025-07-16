"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";

const LocationSearch = ({ userLocation, setUserLocation, setError }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [servicesReady, setServicesReady] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const autocompleteService = useRef(null);
  const geocoder = useRef(null);
  const searchDebounceTimer = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Initialize Google services when script loads
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
          geocoder.current = new window.google.maps.Geocoder();
          setServicesReady(true);
          setServicesLoading(false);
          console.log("Google Maps services loaded successfully");
        } catch (error) {
          console.error("Error initializing Google Maps services:", error);
          setServicesLoading(false);
        }
      }
    };

    // Check if Google Maps is available every second for a maximum of 10 seconds
    const interval = setInterval(() => {
      checkGoogleMaps();
    }, 1000);

    // Stop checking after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setServicesLoading(false);
      console.log("Google Maps services failed to load, using fallback");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Handle clicks outside of the results dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fallback search using LocationIQ API
  const searchWithLocationIQ = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchingLocation(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.locationiq.com/v1/autocomplete?key=pk.288b6dab564970e7a979efef12013f91&q=${encodeURIComponent(
            query
          )}&limit=10`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const formattedResults = data.map((item) => ({
          description: item.display_name,
          placeId: item.place_id,
          mainText: item.display_name.split(",")[0] || item.display_name,
          secondaryText:
            item.display_name.split(",").slice(1).join(",").trim() || "",
          types: item.type ? [item.type] : [],
          location: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
        }));

        setSearchResults(formattedResults);
        setShowSearchResults(true);
      } catch (err) {
        console.error("LocationIQ search error:", err);
        setError("Unable to search locations. Please try again.");
        setSearchResults([]);
      } finally {
        setSearchingLocation(false);
      }
    },
    [setError]
  );

  const handleLocationSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // If Google Maps services are available, use them
      if (autocompleteService.current) {
        setSearchingLocation(true);
        setError(null);

        try {
          const request = {
            input: query,
            types: ["geocode", "establishment"],
            language: "en",
          };

          // Add location bias if we have user location (optional, not required)
          if (userLocation) {
            request.location = new window.google.maps.LatLng(
              userLocation.lat,
              userLocation.lng
            );
            request.radius = 50000; // 50km radius
          }

          const predictions = await new Promise((resolve, reject) => {
            autocompleteService.current.getPlacePredictions(
              request,
              (predictions, status) => {
                if (
                  status !== window.google.maps.places.PlacesServiceStatus.OK
                ) {
                  reject(status);
                } else {
                  resolve(predictions || []);
                }
              }
            );
          });

          // Format and deduplicate results
          const formattedResults = predictions.map((p) => ({
            description: p.description,
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text || "",
            secondaryText: p.structured_formatting?.secondary_text || "",
            types: p.types || [],
          }));

          setSearchResults(formattedResults);
          setShowSearchResults(true);
        } catch (err) {
          console.error("Google Maps search error:", err);
          // Fallback to LocationIQ if Google Maps fails
          await searchWithLocationIQ(query);
        } finally {
          setSearchingLocation(false);
        }
      } else {
        // Use LocationIQ as fallback
        await searchWithLocationIQ(query);
      }
    },
    [userLocation, setError, searchWithLocationIQ]
  );

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    (query) => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }

      searchDebounceTimer.current = setTimeout(() => {
        handleLocationSearch(query);
      }, 300);
    },
    [handleLocationSearch]
  );

  const handleSelectLocation = useCallback(
    async (result) => {
      setSearchingLocation(true);
      setError(null);

      try {
        // If we have coordinates directly from LocationIQ
        if (result.location) {
          setSearchQuery(result.description);
          setUserLocation({
            lat: result.location.lat,
            lng: result.location.lng,
          });
          setShowSearchResults(false);
          return;
        }

        // Otherwise try to geocode with Google Maps
        if (geocoder.current) {
          const geocodeResults = await new Promise((resolve, reject) => {
            geocoder.current.geocode(
              { placeId: result.placeId },
              (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK) {
                  resolve(results);
                } else {
                  reject(status);
                }
              }
            );
          });

          if (geocodeResults && geocodeResults[0]) {
            const location = geocodeResults[0].geometry.location;
            setSearchQuery(result.description);
            setUserLocation({
              lat: location.lat(),
              lng: location.lng(),
            });
            setShowSearchResults(false);
          } else {
            setError("Could not locate this place");
          }
        } else {
          setError("Location services not available");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("Could not get location details");
      } finally {
        setSearchingLocation(false);
      }
    },
    [setUserLocation, setError]
  );

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setSearchingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          if (geocoder.current) {
            const results = await new Promise((resolve, reject) => {
              geocoder.current.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  if (status === "OK") {
                    resolve(results);
                  } else {
                    reject(status);
                  }
                }
              );
            });

            setSearchQuery(results[0]?.formatted_address || "Current location");
          } else {
            setSearchQuery("Current location");
          }

          setUserLocation({
            lat: latitude,
            lng: longitude,
          });
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setSearchQuery("Current location");
          setUserLocation({
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setSearchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Could not get your location. Please try searching instead.");
        setSearchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [setUserLocation, setError]);

  return (
    <div className="relative mb-4">
      <div className="flex items-center border border-gray-300 rounded-full shadow-sm mb-2">
        {/* <MapPin size={16} className="text-primary ml-3" /> */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder={
            servicesReady
              ? "Search for any location, city, zip code, or address"
              : "Loading map services... You can type to search once ready"
          }
          className="flex-grow px-2 py-2 focus:outline-none text-sm rounded-full"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            if (value.length > 2) {
              debouncedSearch(value);
            } else {
              setShowSearchResults(false);
            }
          }}
          onFocus={() => {
            if (searchResults.length > 0) setShowSearchResults(true);
          }}
        />
        {searchQuery && (
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={() => {
              setSearchQuery("");
              setShowSearchResults(false);
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        <div className="flex">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 flex items-center justify-center mr-1"
            onClick={handleGetCurrentLocation}
            title="Use my current location"
            disabled={!servicesReady}
          >
            <Navigation size={16} />
          </button>
          <button
            type="button"
            className="bg-primary p-1.5 rounded-full text-black mr-1 flex items-center justify-center h-8 w-8 min-w-0 min-h-0"
            onClick={() => handleLocationSearch(searchQuery)}
            disabled={searchingLocation || !searchQuery.trim()}
            aria-label="Search locations"
          >
            {searchingLocation ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
          </button>
        </div>
      </div>

      {servicesLoading && (
        <div className="text-xs text-gray-600 ml-2 flex items-center">
          <Loader2 size={12} className="animate-spin mr-1" />
          Loading map services...
        </div>
      )}

      {!servicesLoading && !servicesReady && (
        <div className="text-xs text-yellow-600 ml-2">
          Using fallback search service. Search functionality is available.
        </div>
      )}

      {searchingLocation && (
        <div className="text-xs text-gray-600 ml-2">Searching...</div>
      )}

      {showSearchResults && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectLocation(result)}
              role="option"
              aria-selected="false"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-medium text-sm truncate">
                    {result.mainText}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.secondaryText}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;

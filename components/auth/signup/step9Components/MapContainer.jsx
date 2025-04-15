import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { GOOGLE_API } from "@/shared/constants/backendLink";

const DEG2RAD = Math.PI / 180;
const MILES_TO_METERS = 1609.34;
const MAX_SEARCH_RADIUS = 50000; // 50km in meters

const MapContainer = ({
  userLocation,
  distance,
  attachedMosques,
  toggleMosqueAttachment,
  setError,
  googleMapsApiKey,
}) => {
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mosques, setMosques] = useState([]);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [searchingMosques, setSearchingMosques] = useState(false);
  const [placesService, setPlacesService] = useState(null);

  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: "400px",
      borderRadius: "8px",
    }),
    []
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    }),
    []
  );

  const circleOptions = useMemo(
    () => ({
      strokeColor: "#4f46e5",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#4f46e5",
      fillOpacity: 0.1,
      clickable: false,
    }),
    []
  );

  // Initialize places service when map loads
  useEffect(() => {
    if (isMapLoaded && map) {
      setPlacesService(new google.maps.places.PlacesService(map));
    }
  }, [isMapLoaded, map]);

  // Calculate distance between two points in miles
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * DEG2RAD;
    const dLon = (lon2 - lon1) * DEG2RAD;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * DEG2RAD) *
        Math.cos(lat2 * DEG2RAD) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // Convert km to miles
  }, []);

  // Search for mosques when parameters change
  const findMosques = useCallback(async () => {
    if (!placesService || !userLocation) return;

    setSearchingMosques(true);
    setError(null);

    try {
      const radiusMeters = Math.min(
        distance * MILES_TO_METERS,
        MAX_SEARCH_RADIUS
      );

      const request = {
        location: userLocation,
        radius: radiusMeters,
        type: "place_of_worship",
        keyword: "mosque",
      };

      // Wrap the callback in a promise for better error handling
      const results = await new Promise((resolve, reject) => {
        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
          } else {
            reject(status);
          }
        });
      });

      const formattedMosques = results
        .map((result) => ({
          id:
            result.place_id ||
            `${result.geometry?.location.lat()}-${result.geometry?.location.lng()}`,
          name: result.name || "Unnamed Mosque",
          address: result.vicinity || "Address not available",
          location: {
            lat: result.geometry?.location.lat() || 0,
            lng: result.geometry?.location.lng() || 0,
          },
          rating: result.rating,
          user_ratings_total: result.user_ratings_total,
        }))
        .filter(
          (mosque) => mosque.location.lat !== 0 && mosque.location.lng !== 0
        );

      setMosques(formattedMosques);

      // Adjust map view if we have results
      if (map && formattedMosques.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        formattedMosques.forEach((mosque) => {
          bounds.extend(
            new google.maps.LatLng(mosque.location.lat, mosque.location.lng)
          );
        });
        bounds.extend(
          new google.maps.LatLng(userLocation.lat, userLocation.lng)
        );
        map.fitBounds(bounds);

        // Set max zoom level to ensure markers are visible
        const listener = google.maps.event.addListenerOnce(
          map,
          "bounds_changed",
          () => {
            if (map.getZoom() > 14) map.setZoom(14);
          }
        );
      }
    } catch (status) {
      switch (status) {
        case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
          setError(
            "No mosques found in this area. Try increasing the search distance."
          );
          break;
        case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
          setError("Map request limit exceeded. Please try again later.");
          break;
        default:
          setError("Error searching for mosques. Please try again.");
      }
      setMosques([]);
    } finally {
      setSearchingMosques(false);
    }
  }, [placesService, userLocation, distance, setError, map]);

  // Trigger mosque search when dependencies change
  useEffect(() => {
    if (placesService && userLocation) {
      findMosques();
    }
  }, [placesService, userLocation, distance, findMosques]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setIsMapLoaded(true);
  }, []);

  const isMosqueAttached = useCallback(
    (mosqueId) => {
      return attachedMosques.some((mosque) => mosque.id === mosqueId);
    },
    [attachedMosques]
  );

  const createMosqueIcon = useCallback((isAttached) => {
    const color = isAttached ? "#10B981" : "#EF4444"; // Green for attached, red for unattached

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="${color}">
        <path d="M32 8c0 3-2 6-6 6s-6-3-6-6 2-6 6-6 6 3 6 6z" fill="white"/>
        <path d="M16 28c0-8 8-14 16-14s16 6 16 14v4H16v-4z" />
        <path d="M12 32h40v24H12z" />
        <rect x="28" y="38" width="8" height="18" fill="white"/>
        <path d="M20 32v-4c0-6.627 7.373-12 16-12s16 5.373 16 12v4" fill="none" stroke="white" stroke-width="2"/>
        <circle cx="32" cy="8" r="1.5" fill="white"/>
      </svg>
    `;

    return {
      url: `data:image/svg+xml;base64,${btoa(svg)}`,
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 36),
    };
  }, []);

  const handleMosqueClick = useCallback(
    (mosque) => {
      setSelectedMosque(mosque);
      if (map) {
        map.panTo(mosque.location);
      }
    },
    [map]
  );

  const handleToggleAttachment = useCallback(
    (mosque) => {
      toggleMosqueAttachment({
        ...mosque,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mosque.location.lat,
          mosque.location.lng
        ),
      });
      setSelectedMosque(null);
    },
    [toggleMosqueAttachment, userLocation, calculateDistance]
  );

  const fitMapToBounds = useCallback(() => {
    if (map && mosques.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      mosques.forEach((mosque) => {
        bounds.extend(
          new google.maps.LatLng(mosque.location.lat, mosque.location.lng)
        );
      });
      bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));
      map.fitBounds(bounds);
    }
  }, [map, mosques, userLocation]);

  return (
    <div className="mb-4 relative">
      <LoadScript
        googleMapsApiKey={GOOGLE_API}
        libraries={["places"]}
        loadingElement={
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation}
          zoom={12}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {isMapLoaded && (
            <>
              {/* User location marker */}
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4f46e5",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />

              {/* Search radius circle */}
              <Circle
                center={userLocation}
                radius={Math.min(distance * MILES_TO_METERS, MAX_SEARCH_RADIUS)}
                options={circleOptions}
              />

              {/* Mosque markers */}
              {mosques.map((mosque) => (
                <Marker
                  key={mosque.id}
                  position={mosque.location}
                  onClick={() => handleMosqueClick(mosque)}
                  icon={createMosqueIcon(isMosqueAttached(mosque.id))}
                />
              ))}

              {/* Info window for selected mosque */}
              {selectedMosque && (
                <InfoWindow
                  position={selectedMosque.location}
                  onCloseClick={() => setSelectedMosque(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-medium text-base">
                      {selectedMosque.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedMosque.address}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedMosque.location.lat,
                        selectedMosque.location.lng
                      ).toFixed(1)}{" "}
                      miles away
                    </p>

                    {selectedMosque.rating && (
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(selectedMosque.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">
                          {selectedMosque.rating} (
                          {selectedMosque.user_ratings_total || 0})
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleAttachment(selectedMosque)}
                      className={`mt-2 text-sm text-white px-3 py-1 rounded-full w-full ${
                        isMosqueAttached(selectedMosque.id)
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-primary hover:bg-opacity-90"
                      }`}
                    >
                      {isMosqueAttached(selectedMosque.id)
                        ? "Remove Connection"
                        : "Connect with Mosque"}
                    </button>
                  </div>
                </InfoWindow>
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>

      {/* UI overlays */}
      {searchingMosques && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded-lg shadow-md z-10 flex items-center">
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          <span className="text-sm">Searching for mosques...</span>
        </div>
      )}

      <div className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow-md text-xs">
        <p>
          Showing {mosques.length} mosques within {distance} miles
        </p>
      </div>

      {mosques.length > 0 && (
        <button
          type="button"
          onClick={fitMapToBounds}
          className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md text-xs text-primary flex items-center"
        >
          <span>Show all mosques</span>
        </button>
      )}
    </div>
  );
};

export default MapContainer;

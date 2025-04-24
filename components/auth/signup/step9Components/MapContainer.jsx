import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { Loader2, Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import { GOOGLE_API } from "@/shared/constants/backendLink";
import { createPortal } from "react-dom";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const MILES_TO_METERS = 1609.34;
const MAX_SEARCH_RADIUS = 30000; // 30km in meters
const GRID_SIZE = 4; // Grid cells for large area searches
const BATCH_SIZE = 20; // Number of markers to render in each batch
const MARKER_PROXIMITY_THRESHOLD = 20; // Pixel distance to trigger cluster UI

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
  const [visibleMosques, setVisibleMosques] = useState([]);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [hoveredMosqueId, setHoveredMosqueId] = useState(null);
  const [searchingMosques, setSearchingMosques] = useState(false);
  const [searchProgress, setSearchProgress] = useState({
    current: 0,
    total: 0,
  });
  const [placesService, setPlacesService] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [nearbyMosques, setNearbyMosques] = useState(null);
  const [isMosqueListOpen, setIsMosqueListOpen] = useState(false);
  const mapContainerRef = useRef(null);
  const viewportMosquesRef = useRef([]);
  const renderTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Default and full-screen map styles
  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: isFullScreen ? "85vh" : "400px",
      borderRadius: isFullScreen ? "0" : "8px",
      transition: "height 0.3s ease-in-out",
    }),
    [isFullScreen]
  );

  // Map options with clustering enabled
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false, // We'll implement our own
      clickableIcons: false, // Improve performance
      maxZoom: 18,
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
      setPlacesService(new window.google.maps.places.PlacesService(map));
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

  // Calculate a grid of coordinates to search in
  const calculateSearchGrid = useCallback((center, radiusMiles) => {
    const radiusMeters = radiusMiles * MILES_TO_METERS;

    // If radius is small enough, just use one search centered on the user
    if (radiusMeters <= MAX_SEARCH_RADIUS / 2) {
      return [{ lat: center.lat, lng: center.lng }];
    }

    // For larger areas, create a grid of search points
    const gridPoints = [];
    const gridRadius = Math.min(radiusMeters, MAX_SEARCH_RADIUS);

    // Calculate the angular distance in degrees
    const latDelta = (gridRadius / 111320) * (GRID_SIZE / 2);
    // Longitude degrees per meter vary by latitude
    const lngDelta =
      (gridRadius / (111320 * Math.cos(center.lat * DEG2RAD))) *
      (GRID_SIZE / 2);

    const latStep = (2 * latDelta) / (GRID_SIZE - 1);
    const lngStep = (2 * lngDelta) / (GRID_SIZE - 1);

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const lat = center.lat - latDelta + i * latStep;
        const lng = center.lng - lngDelta + j * lngStep;
        gridPoints.push({ lat, lng });
      }
    }

    return gridPoints;
  }, []);

  // Perform a Places API search with pagination to get all results
  const performPlacesSearch = useCallback(
    async (location, radius) => {
      if (!placesService) return [];

      const actualRadius = Math.min(radius, MAX_SEARCH_RADIUS);
      let allResults = [];
      let token = null;

      const request = {
        location,
        radius: actualRadius,
        type: "place_of_worship",
        keyword: "mosque",
      };

      do {
        try {
          // If we have a token from a previous search, use it
          if (token) request.pageToken = token;

          // Wait 2 seconds if using a page token (required by Google API)
          if (token) await new Promise((resolve) => setTimeout(resolve, 2000));

          // Perform the search
          const results = await new Promise((resolve, reject) => {
            placesService.nearbySearch(
              request,
              (results, status, pagination) => {
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK
                ) {
                  // Save the next page token if there is one
                  token =
                    pagination && pagination.hasNextPage
                      ? pagination.nextPage()
                      : null;
                  resolve(results || []);
                } else if (
                  status ===
                  window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
                ) {
                  resolve([]);
                } else {
                  reject(status);
                }
              }
            );
          });

          allResults = [...allResults, ...results];
        } catch (error) {
          console.error("Error in search pagination:", error);
          token = null;
        }
      } while (token);

      return allResults;
    },
    [placesService]
  );

  // Search for mosques at all grid points
  const findAllMosques = useCallback(async () => {
    if (!placesService || !userLocation) return;

    setSearchingMosques(true);
    setError(null);
    setMosques([]);
    setVisibleMosques([]);

    try {
      // Calculate grid points based on search radius
      const searchPoints = calculateSearchGrid(userLocation, distance);
      setSearchProgress({ current: 0, total: searchPoints.length });

      // Store seen place IDs to avoid duplicates
      const seenPlaceIds = new Set();
      let allMosques = [];

      // Search at each grid point
      for (let i = 0; i < searchPoints.length; i++) {
        setSearchProgress({ current: i + 1, total: searchPoints.length });

        const searchPoint = searchPoints[i];
        const searchRadius = Math.min(
          distance * MILES_TO_METERS,
          MAX_SEARCH_RADIUS
        );

        try {
          const results = await performPlacesSearch(searchPoint, searchRadius);

          // Process and deduplicate results
          const newMosques = results
            .filter((result) => !seenPlaceIds.has(result.place_id))
            .map((result) => {
              seenPlaceIds.add(result.place_id);
              return {
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
              };
            })
            .filter(
              (mosque) =>
                mosque.location.lat !== 0 &&
                mosque.location.lng !== 0 &&
                // Ensure mosque is actually within the requested distance
                calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  mosque.location.lat,
                  mosque.location.lng
                ) <= distance
            );

          allMosques = [...allMosques, ...newMosques];

          // Add distance property to each mosque
          const mosquesWithDistance = newMosques.map((mosque) => ({
            ...mosque,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              mosque.location.lat,
              mosque.location.lng
            ),
          }));

          // Update mosques state incrementally to show progress
          setMosques((current) => [...current, ...mosquesWithDistance]);

          // Render the first batch of mosques immediately for better UX
          if (i === 0) {
            setVisibleMosques(mosquesWithDistance.slice(0, BATCH_SIZE));
          }
        } catch (error) {
          console.error(`Error searching at point ${i}:`, error);
          // Continue with other points even if one fails
        }
      }

      // Adjust map view to show all markers
      if (map && allMosques.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        allMosques.forEach((mosque) => {
          bounds.extend(
            new window.google.maps.LatLng(
              mosque.location.lat,
              mosque.location.lng
            )
          );
        });
        bounds.extend(
          new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
        );
        map.fitBounds(bounds);

        // Set max zoom level to ensure markers are visible
        const listener = window.google.maps.event.addListenerOnce(
          map,
          "bounds_changed",
          () => {
            if (map.getZoom() > 14) map.setZoom(14);
          }
        );
      }

      if (allMosques.length === 0) {
        setError(
          "No mosques found within " +
            distance +
            " miles. Try increasing the search distance."
        );
      }
    } catch (error) {
      console.error("Overall search error:", error);
      setError("Error searching for mosques. Please try again.");
    } finally {
      setSearchingMosques(false);
      setSearchProgress({ current: 0, total: 0 });
      setIsInitialLoad(false);
    }
  }, [
    placesService,
    userLocation,
    distance,
    setError,
    map,
    calculateSearchGrid,
    performPlacesSearch,
    calculateDistance,
  ]);

  // Trigger mosque search when dependencies change
  useEffect(() => {
    if (placesService && userLocation) {
      findAllMosques();
    }
  }, [placesService, userLocation, distance, findAllMosques]);

  // Map event handlers
  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setIsMapLoaded(true);

    // Add bounds changed listener for viewport marker optimization
    window.google.maps.event.addListener(mapInstance, "bounds_changed", () => {
      setMapBounds(mapInstance.getBounds());
    });

    // Add mouse move listener to track cursor position for marker hinting
    window.google.maps.event.addListener(mapInstance, "mousemove", (e) => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }

      hoverTimerRef.current = setTimeout(() => {
        findNearbyMosquesToCursor(e.latLng);
      }, 50); // Slight delay to prevent excessive calculations
    });
  }, []);

  // Find mosques near the cursor for better hover detection
  const findNearbyMosquesToCursor = useCallback(
    (latLng) => {
      if (!map || !visibleMosques.length) return;

      const cursorPoint = map.getProjection().fromLatLngToPoint(latLng);

      // Find all mosques within threshold pixels of cursor
      const nearbyMosques = visibleMosques.filter((mosque) => {
        const markerPoint = map
          .getProjection()
          .fromLatLngToPoint(
            new window.google.maps.LatLng(
              mosque.location.lat,
              mosque.location.lng
            )
          );

        // Calculate pixel distance
        const pixelDistance = Math.sqrt(
          Math.pow(
            (markerPoint.x - cursorPoint.x) * Math.pow(2, map.getZoom()),
            2
          ) +
            Math.pow(
              (markerPoint.y - cursorPoint.y) * Math.pow(2, map.getZoom()),
              2
            )
        );

        return pixelDistance <= MARKER_PROXIMITY_THRESHOLD;
      });

      if (nearbyMosques.length > 1) {
        setNearbyMosques(nearbyMosques);
      } else {
        setNearbyMosques(null);
        setIsMosqueListOpen(false);
      }
    },
    [map, visibleMosques]
  );

  // Update visible mosques based on map bounds
  useEffect(() => {
    if (!mapBounds || !mosques.length) return;

    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current);
    }

    // Debounce the bounds update to prevent excessive re-renders
    renderTimerRef.current = setTimeout(() => {
      const newVisibleMosques = mosques.filter((mosque) => {
        // Check if mosque is in current viewport bounds
        const mosqueLatLng = new window.google.maps.LatLng(
          mosque.location.lat,
          mosque.location.lng
        );
        return mapBounds.contains(mosqueLatLng);
      });

      // If there are too many visible mosques, limit them
      const finalVisibleMosques =
        newVisibleMosques.length > 200
          ? newVisibleMosques.slice(0, 200)
          : newVisibleMosques;

      // Keep track of currently visible mosques for render optimization
      viewportMosquesRef.current = finalVisibleMosques;
      setVisibleMosques(finalVisibleMosques);
    }, 100);
  }, [mapBounds, mosques]);

  const isMosqueAttached = useCallback(
    (mosqueId) => {
      return attachedMosques.some((mosque) => mosque.id === mosqueId);
    },
    [attachedMosques]
  );

  // Create different icons for normal, hovered, and clustered mosques
  const createMosqueIcon = useCallback((isAttached, isHovered, isClose) => {
    const color = isAttached ? "#10B981" : "#EF4444"; // Green for attached, red for unattached
    const scale = isHovered ? 1.2 : isClose ? 1.1 : 1.0; // Larger when hovered/clustered
    const zIndex = isHovered ? 1000 : isClose ? 900 : 1; // Higher z-index for hovered

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
      scaledSize: new window.google.maps.Size(36 * scale, 36 * scale),
      anchor: new window.google.maps.Point(18 * scale, 36 * scale),
      zIndex: zIndex,
    };
  }, []);

  const handleMosqueClick = useCallback(
    (mosque) => {
      setSelectedMosque(mosque);
      setIsMosqueListOpen(false);
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
      setIsMosqueListOpen(false);
    },
    [toggleMosqueAttachment, userLocation, calculateDistance]
  );

  const handleMarkerHover = useCallback((mosqueId) => {
    setHoveredMosqueId(mosqueId);
  }, []);

  const handleMarkerLeave = useCallback(() => {
    setHoveredMosqueId(null);
  }, []);

  const handleClusterClick = useCallback((event) => {
    setIsMosqueListOpen(true);
  }, []);

  const fitMapToBounds = useCallback(() => {
    if (map && mosques.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mosques.forEach((mosque) => {
        bounds.extend(
          new window.google.maps.LatLng(
            mosque.location.lat,
            mosque.location.lng
          )
        );
      });
      bounds.extend(
        new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
      );
      map.fitBounds(bounds);
    }
  }, [map, mosques, userLocation]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  // Render the full-screen modal
  const renderFullScreenModal = () => {
    if (!isFullScreen) return null;

    return createPortal(
      <div className="fixed inset-0 z-50 bg-white bg-opacity-95 overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <button
            onClick={toggleFullScreen}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Form</span>
          </button>
          <div className="text-center flex-grow">
            <h2 className="font-medium">Map View</h2>
            <p className="text-sm text-gray-600">
              {mosques.length} mosques within {distance} miles
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
        <div className="flex-grow" ref={mapContainerRef}>
          {/* Map will be moved here when in full-screen mode */}
        </div>
      </div>,
      document.body
    );
  };

  // Render the mosque selection popup for clustered markers
  const renderMosqueSelectionPopup = () => {
    if (!nearbyMosques || !isMosqueListOpen) return null;

    // Find the center position of the clustered mosques
    const centerLat =
      nearbyMosques.reduce((sum, mosque) => sum + mosque.location.lat, 0) /
      nearbyMosques.length;
    const centerLng =
      nearbyMosques.reduce((sum, mosque) => sum + mosque.location.lng, 0) /
      nearbyMosques.length;

    // Convert LatLng to pixel position
    const projection = map.getProjection();
    const position = projection.fromLatLngToPoint(
      new window.google.maps.LatLng(centerLat, centerLng)
    );

    // Position the popup
    const positionStyle = {
      position: "absolute",
      left: position.x * Math.pow(2, map.getZoom()) + "px",
      top: position.y * Math.pow(2, map.getZoom()) + "px",
      transform: "translate(-50%, -100%)",
      zIndex: 1000,
    };

    return (
      <div
        className="bg-white rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto w-64"
        style={positionStyle}
      >
        <div className="text-sm font-medium mb-2 px-2 py-1 bg-gray-100 rounded">
          {nearbyMosques.length} mosques close together
        </div>
        {nearbyMosques.map((mosque) => (
          <div
            key={mosque.id}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => handleMosqueClick(mosque)}
          >
            <div className="font-medium truncate">{mosque.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {mosque.address}
            </div>
            <div className="text-xs mt-1">
              {mosque.distance.toFixed(1)} miles away
            </div>
          </div>
        ))}
        <div className="text-xs text-center mt-2 text-gray-500">
          Click a mosque to select it
        </div>
      </div>
    );
  };

  // Render cluster marker for overlapping mosques
  const renderClusterMarker = () => {
    if (!nearbyMosques || nearbyMosques.length <= 1) return null;

    // Find the center position of the clustered mosques
    const centerLat =
      nearbyMosques.reduce((sum, mosque) => sum + mosque.location.lat, 0) /
      nearbyMosques.length;
    const centerLng =
      nearbyMosques.reduce((sum, mosque) => sum + mosque.location.lng, 0) /
      nearbyMosques.length;

    // Count attached mosques in this cluster
    const attachedCount = nearbyMosques.filter((mosque) =>
      isMosqueAttached(mosque.id)
    ).length;

    return (
      <Marker
        position={{ lat: centerLat, lng: centerLng }}
        onClick={handleClusterClick}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#4f46e5",
          fillOpacity: 0.7,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 15,
          labelOrigin: new window.google.maps.Point(0, 0),
        }}
        label={{
          text: nearbyMosques.length.toString(),
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold",
        }}
        zIndex={1000}
      />
    );
  };

  return (
    <div className="mb-4 relative">
      {renderFullScreenModal()}

      <LoadScript
        googleMapsApiKey={googleMapsApiKey || GOOGLE_API}
        libraries={["places"]}
        loadingElement={
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        }
      >
        <div className={isFullScreen ? "hidden" : ""}>
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
                    path: window.google.maps.SymbolPath.CIRCLE,
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
                  radius={distance * MILES_TO_METERS}
                  options={circleOptions}
                />

                {/* Mosque markers - only render visible ones */}
                {visibleMosques.map((mosque) => {
                  // Skip rendering individual markers if they're in the current cluster and list is open
                  const isInOpenCluster =
                    nearbyMosques &&
                    isMosqueListOpen &&
                    nearbyMosques.some((m) => m.id === mosque.id);

                  if (isInOpenCluster) return null;

                  const isHovered = hoveredMosqueId === mosque.id;
                  const isClose =
                    nearbyMosques &&
                    nearbyMosques.some((m) => m.id === mosque.id);

                  return (
                    <Marker
                      key={mosque.id}
                      position={mosque.location}
                      onClick={() => handleMosqueClick(mosque)}
                      onMouseOver={() => handleMarkerHover(mosque.id)}
                      onMouseOut={handleMarkerLeave}
                      icon={createMosqueIcon(
                        isMosqueAttached(mosque.id),
                        isHovered,
                        isClose
                      )}
                    />
                  );
                })}

                {/* Render cluster marker for overlapping mosques */}
                {renderClusterMarker()}

                {/* Render mosque selection popup */}
                {isMapLoaded && renderMosqueSelectionPopup()}

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
                        {typeof selectedMosque.distance === "number"
                          ? selectedMosque.distance.toFixed(1)
                          : calculateDistance(
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
        </div>
      </LoadScript>

      {/* UI overlays */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {searchingMosques && (
          <div className="bg-white p-2 rounded-lg shadow-md flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            <span className="text-sm">
              Searching for mosques...
              {searchProgress.total > 0 &&
                `(${searchProgress.current}/${searchProgress.total})`}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow-md text-xs">
        <p>
          Found {mosques.length} mosques within {distance} miles
          {visibleMosques.length < mosques.length &&
            !isInitialLoad &&
            ` (${visibleMosques.length} visible)`}
        </p>
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        {mosques.length > 0 && (
          <button
            type="button"
            onClick={fitMapToBounds}
            className="bg-white p-2 rounded-lg shadow-md text-xs text-primary flex items-center"
          >
            <span>Show all</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullScreen}
          className="bg-white p-2 rounded-lg shadow-md flex items-center justify-center"
          title={isFullScreen ? "Exit full screen" : "Full screen"}
        >
          {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default MapContainer;

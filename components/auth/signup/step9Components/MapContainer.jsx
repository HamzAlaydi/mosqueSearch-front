"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { MarkerClustererF } from "@react-google-maps/api"; // Import MarkerClustererF
import { Loader2, Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";
import { allMosquesInLondon } from "@/shared/allMosquesInLondon"; // Import the mosque data
import { GOOGLE_API } from "@/shared/constants/backendLink";

// Constants
const DEG2RAD = Math.PI / 180;
const MILES_TO_METERS = 1609.34;
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }; // Default fallback center (London)
const INFOWINDOW_PAN_PIXEL_OFFSET_Y = 150; // Pixels to pan down when InfoWindow opens (adjust if needed)

const MAP_CONTAINER_STYLE_DEFAULT = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
  overflow: "hidden", // Ensures child elements like InfoWindow don't spill
  position: "relative", // Helps anchor elements properly
  transition: "height 0.3s ease-in-out",
};

const MAP_CONTAINER_STYLE_FULLSCREEN = {
  width: "100%",
  height: "calc(100vh - 80px)", // Adjust depending on header/footer height
  borderRadius: "0",
  overflow: "hidden",
  position: "relative",
  transition: "height 0.3s ease-in-out",
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false, // We'll implement our own
  clickableIcons: false, // Improve performance
  maxZoom: 18,
  // Simplified styles for performance/cleanliness
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const CIRCLE_OPTIONS = {
  strokeColor: "#4f46e5", // Indigo
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#4f46e5",
  fillOpacity: 0.1,
  clickable: false,
};

const CLUSTER_OPTIONS = {
  gridSize: 60, // Group markers within this pixel grid size
  maxZoom: 14, // Stop clustering at this zoom level
  minimumClusterSize: 2, // Minimum number of markers to form a cluster
  // You can add styles here or use a custom render function
  styles: [
    {
      textColor: "white",
      url:
        "data:image/svg+xml;utf-8," +
        encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#4f46e5" fill-opacity="0.7"/>
            </svg>
          `),
      height: 40,
      width: 40,
      anchorText: [0, 5], // Adjust text vertical alignment
    },
  ],
};

// Create a flag to track if script has been loaded - global across component instances
const googleMapsScriptLoaded =
  typeof window !== "undefined" ? window.googleMapsScriptLoaded : false;

const MapContainer = ({
  userLocation, // { lat, lng } or null
  distance, // in miles
  attachedMosques, // array of attached mosque objects
  toggleMosqueAttachment, // function to handle attach/detach
  setError, // function to set error message in parent
  googleMapsApiKey, // Your Google API key
}) => {
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [hoveredMosqueId, setHoveredMosqueId] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store map instance in a ref for persistence

  // Use the useLoadScript hook instead of LoadScript component
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API || "",
    libraries: ["geometry"],
    // Prevent script reloading on component remount
    preventGoogleFontsLoading: true,
  });

  // Set global flag once script is loaded
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      window.googleMapsScriptLoaded = true;
    }
  }, [isLoaded]);

  // Handle load errors
  useEffect(() => {
    if (loadError) {
      console.error("Error loading Google Maps:", loadError);
      setError?.("Failed to load Google Maps. Please try again.");
    }
  }, [loadError, setError]);

  // Keep track of the list of attached mosque IDs for efficient lookup
  const attachedMosqueIds = useMemo(() => {
    return new Set(attachedMosques?.map((m) => m.id).filter(Boolean) || []);
  }, [attachedMosques]);

  // Calculate distance between two points in miles
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (
      lat1 === undefined ||
      lon1 === undefined ||
      lat2 === undefined ||
      lon2 === undefined
    )
      return Infinity; // Handle missing data

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

  // Process and filter mosques from the imported list
  const filteredMosques = useMemo(() => {
    if (!userLocation || !distance || !allMosquesInLondon) return [];

    const radiusMiles = typeof distance === "number" ? distance : Infinity; // Use Infinity if distance is not a number

    const processed = allMosquesInLondon
      .map((mosque) => {
        // Handle both {lat, lng} and GeoJSON formats from your imported data if needed
        let lat = 0;
        let lng = 0;

        if (mosque.location) {
          if (
            typeof mosque.location.lat === "number" &&
            typeof mosque.location.lng === "number"
          ) {
            lat = mosque.location.lat;
            lng = mosque.location.lng;
          } else if (
            mosque.location.type === "Point" &&
            Array.isArray(mosque.location.coordinates) &&
            mosque.location.coordinates.length >= 2
          ) {
            lng = mosque.location.coordinates[0];
            lat = mosque.location.coordinates[1];
          }
        }

        // Ensure location data is valid before proceeding
        if (lat === 0 && lng === 0) return null; // Skip if location is invalid

        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );

        // Only include mosques within the specified distance radius
        if (dist > radiusMiles) return null;

        return {
          ...mosque, // Keep original mosque data
          // Ensure unique ID and consistent location format
          id: mosque._id || mosque.id || `${lat}-${lng}-${mosque.name}`, // Fallback ID
          location: { lat, lng },
          distance: dist, // Add calculated distance
          isAttached:
            attachedMosqueIds.has(mosque._id) ||
            attachedMosqueIds.has(mosque.id), // Check attachment status
          // Assume structure might be similar to the first component's processing
          hasFemaleArea:
            mosque.facilities?.includes("Female Prayer Area") ||
            mosque.femaleArea ||
            false,
          description: mosque.description || "", // Include description if available
        };
      })
      .filter((mosque) => mosque !== null); // Filter out mosques with invalid locations or outside radius

    return processed;
  }, [userLocation, distance, attachedMosqueIds, calculateDistance]); // Add calculateDistance to dependencies

  // Fit map to bounds when filtered mosques change or map loads
  const fitMapToBounds = useCallback(() => {
    const currentMap = mapInstanceRef.current;
    if (!currentMap || !isMapLoaded || !userLocation) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Extend bounds for all filtered mosques
    filteredMosques.forEach((mosque) => {
      bounds.extend(
        new window.google.maps.LatLng(mosque.location.lat, mosque.location.lng)
      );
    });

    // Also extend bounds for the user's location
    bounds.extend(
      new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
    );

    // Handle cases with 0 or 1 mosque + user location
    if (filteredMosques.length === 0) {
      // If no mosques found, just center on user and show the circle
      currentMap.setCenter(userLocation);
      currentMap.setZoom(12); // Default zoom
    } else if (filteredMosques.length === 1) {
      // If only one mosque, include it and the user in the bounds
      bounds.extend(
        new window.google.maps.LatLng(
          filteredMosques[0].location.lat,
          filteredMosques[0].location.lng
        )
      );
      currentMap.fitBounds(bounds, { padding: 100 }); // Add more padding for a single marker + user location
      const listener = window.google.maps.event.addListenerOnce(
        currentMap,
        "bounds_changed",
        () => {
          if (currentMap.getZoom() > 16) currentMap.setZoom(16); // Prevent zooming in too close
        }
      );
    } else {
      // Fit bounds for multiple mosques and user location
      currentMap.fitBounds(bounds, { padding: 50 }); // Add some padding
      // Optional: Limit max zoom after fitting bounds if it zoomed in too much
      const listener = window.google.maps.event.addListenerOnce(
        currentMap,
        "bounds_changed",
        () => {
          if (currentMap.getZoom() > 15) currentMap.setZoom(15); // Prevent zooming in too close on dense clusters/markers
        }
      );
    }
  }, [filteredMosques, userLocation, isMapLoaded]); // Dependencies include map and data

  // Map load handler
  const onMapLoad = useCallback((mapInstance) => {
    mapInstanceRef.current = mapInstance; // Store in ref for persistence
    setMap(mapInstance);
    setIsMapLoaded(true);
  }, []);

  // Trigger map fitting when filtered mosques or map state changes
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      fitMapToBounds();
    }
  }, [isMapLoaded, fitMapToBounds, userLocation, filteredMosques.length]); // Re-fit when data or user location changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No need to explicitly clean up Google Maps as useLoadScript handles it
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
    };
  }, []);

  // Create marker icon based on attachment status (and hover)
  const createMosqueIcon = useCallback(
    (mosque, isHovered) => {
      // Use attachedMosqueIds set for lookup directly
      const isAttached = attachedMosqueIds.has(mosque.id);

      const baseColor = isAttached ? "#10B981" : "#EF4444"; // Green for attached, Red for unattached
      const hoverColor = isAttached ? "#059669" : "#DC2626"; // Darker shades on hover

      const currentColor = isHovered ? hoverColor : baseColor;
      const iconSize = isHovered ? 40 : 36;

      // SVG icon (can be the same as the first component's if preferred)
      const svgContent = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 48C24 48 40 32 40 19C40 10.1634 32.8366 3 24 3C15.1634 3 8 10.1634 8 19C8 32 24 48 24 48Z" fill="${currentColor}" stroke="white" stroke-width="2"/>
        <circle cx="24" cy="19" r="7" fill="white"/>
          ${
            mosque.hasFemaleArea // Use the processed flag
              ? `<circle cx="24" cy="19" r="3" fill="${currentColor}"/>` // Indicate female area with base color dot
              : ""
          }
          ${
            isAttached // Indicate attached status with a star or similar
              ? `<path d="M24 24 L20 30 L28 30 L24 24 Z" fill="white"/>` // Simple triangle for attached
              : ""
          }
      </svg>
    `;

      return {
        url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
        scaledSize: new window.google.maps.Size(iconSize, iconSize),
        anchor: new window.google.maps.Point(iconSize / 2, iconSize), // Anchor at the bottom center
        zIndex: isHovered ? 1000 : isAttached ? 10 : 5,
      };
    },
    [attachedMosqueIds]
  ); // Depends only on attachment state for the base color

  // Handle marker click
  const handleMarkerClick = useCallback(
    (mosque) => {
      // Close current InfoWindow if clicking the same marker
      if (selectedMosque?.id === mosque.id) {
        setSelectedMosque(null);
      } else {
        setSelectedMosque(mosque);
        // Pan the map slightly downwards to better center the InfoWindow content
        // The InfoWindow opens above the marker, so panning down brings the content towards the center.
        if (mapInstanceRef.current && mosque.location) {
          // Use panTo initially to center the marker
          mapInstanceRef.current.panTo({
            lat: mosque.location.lat,
            lng: mosque.location.lng,
          });
          // Use a timeout to allow the panTo animation to start before panning by pixels
          // This value might need fine-tuning based on animation speed/complexity and InfoWindow height
          setTimeout(() => {
            mapInstanceRef.current.panBy(0, INFOWINDOW_PAN_PIXEL_OFFSET_Y);
          }, 200); // Small delay (e.g., 200ms)
        }
      }
      setHoveredMosqueId(null); // Clear hover state on click
    },
    [selectedMosque] // Dependencies include selectedMosque to toggle
  );

  // Handle mosque attachment/detachment toggle
  const handleToggleAttachmentClick = useCallback(
    (mosque) => {
      // Calculate distance if it wasn't already calculated or needed again
      const dist =
        typeof mosque.distance === "number"
          ? mosque.distance
          : calculateDistance(
              userLocation.lat,
              userLocation.lng,
              mosque.location.lat,
              mosque.location.lng
            );

      toggleMosqueAttachment({
        ...mosque,
        distance: dist, // Ensure distance is included
        // Add any other minimal data needed for the parent/backend to identify and store
        // e.g., google Place ID if available
        place_id: mosque.place_id, // Assuming place_id might be available in imported data
      });
      // Optionally close the info window after toggling attachment
      setSelectedMosque(null);
    },
    [toggleMosqueAttachment, userLocation, calculateDistance] // Dependencies
  );

  // Handle InfoWindow close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMosque(null);
  }, []);

  // Fullscreen toggle logic
  const toggleFullScreen = useCallback(() => {
    const mapElement = document.getElementById("google-map-container");
    if (!mapElement) return;

    if (!isFullScreen) {
      // Go to fullscreen mode
      document.body.style.overflow = "hidden"; // Prevent body scroll

      // Create fullscreen container if it doesn't exist
      let fsContainer = document.getElementById("map-fullscreen-container");
      if (!fsContainer) {
        fsContainer = document.createElement("div");
        fsContainer.id = "map-fullscreen-container";
        fsContainer.className = "fixed inset-0 z-50 bg-white flex flex-col";
        document.body.appendChild(fsContainer);

        // Create header
        const header = document.createElement("div");
        header.className =
          "p-4 border-b flex justify-between items-center bg-white shadow-sm";
        header.innerHTML = `
        <button id="exit-fs-button" class="flex items-center text-gray-700 hover:text-gray-900 text-sm font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m15 19-7-7 7-7"></path></svg>
          <span>Back</span>
        </button>
        <div class="text-center flex-grow">
          <h2 class="font-semibold text-lg">Select Mosques</h2>
          <p class="text-sm text-gray-600">
            Found ${filteredMosques.length} mosques within ${distance} miles
          </p>
        </div>
        <div class="w-20"></div>
      `;
        fsContainer.appendChild(header);

        // Create content container
        const content = document.createElement("div");
        content.className = "flex-grow relative";
        content.id = "map-fs-content";
        fsContainer.appendChild(content);

        // Add event listener to exit button
        document
          .getElementById("exit-fs-button")
          .addEventListener("click", () => {
            toggleFullScreen();
          });
      }

      // Move map into fullscreen container
      document.getElementById("map-fs-content").appendChild(mapElement);
    } else {
      // Exit fullscreen mode
      document.body.style.overflow = ""; // Restore body scroll

      // Move map back to original container
      const originalContainer = document.querySelector(".mb-4.relative > div");
      if (originalContainer) {
        originalContainer.appendChild(mapElement);
      }

      // Remove fullscreen container
      const fsContainer = document.getElementById("map-fullscreen-container");
      if (fsContainer) {
        document.body.removeChild(fsContainer);
      }

      // Refit map bounds after a delay to let it resize
      setTimeout(() => {
        fitMapToBounds();
      }, 100);
    }

    // Toggle fullscreen state
    setIsFullScreen(!isFullScreen);

    // Ensure Google Map resizes to fit container
    setTimeout(() => {
      if (window.google && mapInstanceRef.current) {
        window.google.maps.event.trigger(mapInstanceRef.current, "resize");
      }
    }, 200);
  }, [isFullScreen, filteredMosques.length, distance, fitMapToBounds]);

  // Render the full-screen modal portal
  const renderFullScreenModal = () => {
    if (!isFullScreen) return null;

    // The map element itself is moved, so the portal just contains the fullscreen container and controls
    return createPortal(
      <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
          <button
            onClick={toggleFullScreen}
            className="flex items-center text-gray-700 hover:text-gray-900 text-sm font-semibold"
            aria-label="Exit full screen"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </button>
          <div className="text-center flex-grow">
            <h2 className="font-semibold text-lg">Select Mosques</h2>
            <p className="text-sm text-gray-600">
              Found {filteredMosques.length} mosques within {distance} miles
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
        {/* The map will be appended here by toggleFullScreen */}
        <div className="flex-grow relative" ref={mapContainerRef}>
          {/* Optional: Add loading or message overlay inside fullscreen */}
          {isMapLoaded && filteredMosques.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <p className="text-gray-700 font-semibold">
                No mosques found within {distance} miles.
              </p>
            </div>
          )}
        </div>
      </div>,
      document.body // Render into the body
    );
  };

  // Show loading state while the script is loading
  if (!isLoaded) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Loader2 className="animate-spin mr-2 h-6 w-6 text-blue-600" />
        <span className="text-blue-600 font-semibold">Loading map...</span>
      </div>
    );
  }

  // Show error message if script loading failed
  if (loadError) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold">Failed to load Google Maps</p>
          <p className="text-sm mt-2">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 relative">
      {renderFullScreenModal()}

      {/* This div will contain the actual map element */}
      <div
        id="google-map-container"
        style={isFullScreen ? {} : MAP_CONTAINER_STYLE_DEFAULT}
      >
        <GoogleMap
          mapContainerStyle={
            isFullScreen
              ? MAP_CONTAINER_STYLE_FULLSCREEN
              : MAP_CONTAINER_STYLE_DEFAULT
          }
          center={userLocation || DEFAULT_CENTER}
          zoom={userLocation ? 12 : 2}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
          onClick={handleInfoWindowClose}
        >
          {isMapLoaded && userLocation && (
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
                zIndex={20} // Ensure user marker is visible
              />

              {/* Search radius circle */}
              {distance > 0 && (
                <Circle
                  center={userLocation}
                  radius={distance * MILES_TO_METERS}
                  options={CIRCLE_OPTIONS}
                />
              )}
            </>
          )}

          {/* Render Markers with Clustering */}
          {isMapLoaded && filteredMosques.length > 0 && (
            <MarkerClustererF options={CLUSTER_OPTIONS}>
              {(clusterer) =>
                filteredMosques.map((mosque) => {
                  const isCurrentlySelected = selectedMosque?.id === mosque.id;
                  const isCurrentlyHovered = hoveredMosqueId === mosque.id;

                  return (
                    <Marker
                      key={mosque.id}
                      position={mosque.location}
                      onClick={() => handleMarkerClick(mosque)}
                      onMouseOver={() => setHoveredMosqueId(mosque.id)}
                      onMouseOut={() => setHoveredMosqueId(null)}
                      icon={createMosqueIcon(
                        mosque,
                        isCurrentlyHovered || isCurrentlySelected
                      )}
                      clusterer={clusterer}
                      mosqueData={mosque}
                    />
                  );
                })
              }
            </MarkerClustererF>
          )}

          {/* Info window for selected mosque */}
          {selectedMosque && (
            <InfoWindow
              position={selectedMosque.location}
              onCloseClick={handleInfoWindowClose}
              options={{
                // Adjust pixelOffset based on marker icon anchor and height
                // Marker anchor is bottom-center (size/2, size).
                // InfoWindow tip should be above the marker.
                // A POSITIVE Y offset moves the InfoWindow UP relative to the anchor.
                // A value of (marker_height + buffer) will place the tip just above the marker.
                pixelOffset: new window.google.maps.Size(
                  0,
                  (selectedMosque.isHovered ? 40 : 36) + 5 // Positive Y offset to move InfoWindow UP
                ),
                // Setting a min/max width can help control the popup size
                minWidth: 200,
                maxWidth: 300,
                // disableAutoPan is not a direct option here, manual panBy is used
              }}
            >
              {/*
                Wrap InfoWindow content in a div with a solid background.
                Add max-height (increased) and overflow-y-auto to make content scrollable.
              */}
              <div
                className="bg-white p-4 rounded-lg shadow-md max-w-xs w-full text-gray-800 font-sans flex flex-col items-start max-h-80 overflow-y-auto relative"
                style={{ boxSizing: "border-box", width: "100%" }}
              >
                {" "}
                {/* Increased max-h to max-h-80 (320px) */}
                <h3 className="font-bold text-lg mb-1 leading-tight">
                  {selectedMosque.name}
                </h3>
                {/* Added description if available */}
                {selectedMosque.description &&
                  selectedMosque.description.trim() !== "" && (
                    <p className="text-sm text-gray-700 mb-2 leading-snug">
                      {selectedMosque.description}
                    </p>
                  )}
                {/* Added address if available and different from description */}
                {selectedMosque.address &&
                  (selectedMosque.description === undefined ||
                    selectedMosque.address !==
                      selectedMosque.description.trim()) && (
                    <p className="text-sm text-gray-600 mb-2 leading-snug">
                      {selectedMosque.address}
                    </p>
                  )}
                {/* Facilities badges (if available in data and processed) */}
                {(selectedMosque.hasFemaleArea ||
                  selectedMosque.isAttached) && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedMosque.hasFemaleArea && (
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                        Female Prayer Area
                      </span>
                    )}
                    {selectedMosque.isAttached && (
                      <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                        Your Mosque
                      </span>
                    )}
                  </div>
                )}
                {/* Distance */}
                {typeof selectedMosque.distance === "number" && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Distance:</strong>{" "}
                    {selectedMosque.distance.toFixed(1)} miles away
                  </p>
                )}
                {/* Rating (if available) */}
                {selectedMosque.rating && (
                  <div className="flex items-center mt-1">
                    <strong className="text-sm text-gray-600 mr-1">
                      Rating:
                    </strong>
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
                    {selectedMosque.user_ratings_total !== undefined && (
                      <span className="ml-1 text-sm text-gray-600">
                        {selectedMosque.rating.toFixed(1)} (
                        {selectedMosque.user_ratings_total})
                      </span>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleAttachmentClick(selectedMosque)}
                  className={`mt-3 text-sm text-primary px-4 py-2 rounded-md w-full text-center transition-colors font-semibold flex-shrink-0 ${
                    selectedMosque.isAttached
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {selectedMosque.isAttached
                    ? "Detach from Mosque"
                    : "Attach to Mosque"}
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* UI overlays */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {!isMapLoaded && (
          <div className="bg-white p-2 rounded-lg shadow-md flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">
              Loading map and mosques...
            </span>
          </div>
        )}
        {isMapLoaded && !userLocation && (
          <div className="bg-yellow-500 text-white p-2 rounded-lg shadow-md text-sm font-semibold">
            Please provide your location to find nearby mosques.
          </div>
        )}
        {isMapLoaded &&
          userLocation &&
          filteredMosques.length === 0 &&
          distance > 0 && (
            <div className="bg-yellow-500 text-white p-2 rounded-lg shadow-md text-sm font-semibold">
              No mosques found within {distance} miles. Try increasing the
              distance.
            </div>
          )}
      </div>

      {/* Count and Legend */}
      {!isFullScreen &&
        isMapLoaded && ( // Hide legend in fullscreen to save space
          <div className="absolute bottom-2 right-2 z-10 bg-white p-2 rounded-lg shadow-md text-xs flex items-center gap-3">
            <p className="font-semibold text-gray-700">
              Found {filteredMosques.length} mosques within {distance} miles
            </p>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Attached</span>
            </div>
          </div>
        )}

      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {filteredMosques.length > 0 && isMapLoaded && (
          <button
            type="button"
            onClick={fitMapToBounds}
            className="bg-white p-2 rounded-lg shadow-md text-xs text-blue-600 flex items-center font-semibold hover:bg-gray-50 transition-colors"
            aria-label="Fit map to show all mosques"
          >
            <span>Show all</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullScreen}
          className="bg-white p-2 rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          title={isFullScreen ? "Exit full screen" : "Full screen"}
          aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
        >
          {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default MapContainer;

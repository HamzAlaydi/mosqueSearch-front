"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { MarkerClustererF } from "@react-google-maps/api";
import {
  Loader2,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { allMosquesInLondon } from "@/shared/allMosquesInLondon";
import { GOOGLE_API } from "@/shared/constants/backendLink";

// Static libraries array to prevent infinite re-renders
const GOOGLE_MAPS_LIBRARIES = ["geometry"];

// Constants
const DEG2RAD = Math.PI / 180;
const MILES_TO_METERS = 1609.34;
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }; // London
const INFOWINDOW_PAN_PIXEL_OFFSET_Y = 250; // Pixels to pan up for InfoWindow visibility

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
  borderRadius: "8px",
  overflow: "hidden", // Ensures child elements like InfoWindow don't spill
  position: "relative", // Helps anchor elements properly
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true, // Enable Google Maps built-in full screen control
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
  strokeColor: "#2563EB",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#2563EB",
  fillOpacity: 0.1,
  clickable: false,
  zIndex: 1,
};

const CLUSTER_OPTIONS = {
  gridSize: 50,
  maxZoom: 15,
  minimumClusterSize: 3,
  styles: [
    {
      textColor: "white",
      url:
        "data:image/svg+xml;utf-8," +
        encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#2563EB" fillOpacity="0.8"/>
          </svg>
        `),
      height: 40,
      width: 40,
      anchorText: [0, 5],
    },
  ],
  clickable: true,
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
  existingRequests = [], // array of existing imam mosque requests
}) => {
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [hoveredMosqueId, setHoveredMosqueId] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store map instance in a ref for persistence

  // Use the useLoadScript hook instead of LoadScript component
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
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

  // Get request status for a mosque
  const getMosqueRequestStatus = useCallback(
    (mosque) => {
      if (!existingRequests || existingRequests.length === 0) return null;

      // Find request for this mosque
      const request = existingRequests.find((req) => {
        // Compare as strings to avoid type mismatch
        return (
          req.mosqueId?.externalId !== undefined &&
          String(req.mosqueId.externalId) === String(mosque.id)
        );
      });

      return request ? request.status : null;
    },
    [existingRequests]
  );

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

  // Create professional mosque marker icons
  const createMarkerIcon = useCallback(
    (mosque, isHovered, isSelected) => {
      const isAttached = mosque.isAttached;
      const hasFemaleArea = mosque.hasFemaleArea;
      const requestStatus = getMosqueRequestStatus(mosque);

      // Determine base color based on request status
      let baseColor;
      if (requestStatus === "approved") {
        baseColor = "#10B981"; // Green for approved
      } else if (requestStatus === "denied") {
        baseColor = "#EF4444"; // Red for denied
      } else if (requestStatus === "pending") {
        baseColor = "#F59E0B"; // Orange for pending
      } else if (isAttached) {
        baseColor = "#F59E0B"; // Gold/Orange for attached (legacy)
      } else if (hasFemaleArea) {
        baseColor = "#8B5CF6"; // Purple for female area
      } else {
        baseColor = "#2563EB"; // Blue for regular/no request
      }

      // Determine hover color
      let hoverColor;
      if (requestStatus === "approved") {
        hoverColor = "#059669"; // Darker green
      } else if (requestStatus === "denied") {
        hoverColor = "#DC2626"; // Darker red
      } else if (requestStatus === "pending") {
        hoverColor = "#D97706"; // Darker orange
      } else if (isAttached) {
        hoverColor = "#D97706"; // Darker orange
      } else if (hasFemaleArea) {
        hoverColor = "#7C3AED"; // Darker purple
      } else {
        hoverColor = "#1D4ED8"; // Darker blue
      }

      const selectedColor = "#10B981"; // Green for selected

      const currentColor = isSelected
        ? selectedColor
        : isHovered
        ? hoverColor
        : baseColor;

      const iconSize = isHovered || isSelected ? 44 : 40;
      const mosqueSize = isHovered || isSelected ? 24 : 20;

      const svgContent = `
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Background circle -->
          <circle cx="24" cy="24" r="22" fill="${currentColor}" stroke="white" stroke-width="2"/>
          
          <!-- Mosque icon -->
          <g transform="translate(${24 - mosqueSize / 2}, ${
        24 - mosqueSize / 2
      })">
            <!-- Main building -->
            <rect x="4" y="12" width="12" height="8" fill="white" rx="1"/>
            
            <!-- Dome -->
            <path d="M6 12 C6 9, 8 8, 10 8 C12 8, 14 9, 14 12" fill="white"/>
            
            <!-- Minaret left -->
            <rect x="1" y="6" width="2" height="12" fill="white" rx="1"/>
            <circle cx="2" cy="6" r="1" fill="white"/>
            
            <!-- Minaret right -->
            <rect x="17" y="6" width="2" height="12" fill="white" rx="1"/>
            <circle cx="18" cy="6" r="1" fill="white"/>
            
            <!-- Door -->
            <rect x="8.5" y="16" width="3" height="4" fill="${currentColor}" rx="0.5"/>
            
            <!-- Windows -->
            <rect x="6" y="14" width="1.5" height="1.5" fill="${currentColor}" rx="0.2"/>
            <rect x="12.5" y="14" width="1.5" height="1.5" fill="${currentColor}" rx="0.2"/>
          </g>
          
          ${
            hasFemaleArea
              ? `<circle cx="38" cy="10" r="4" fill="#8B5CF6" stroke="white" stroke-width="1"/>`
              : ""
          }
          ${
            isAttached
              ? `<circle cx="38" cy="38" r="4" fill="#F59E0B" stroke="white" stroke-width="1"/>`
              : ""
          }
        </svg>
      `;

      return {
        url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
        scaledSize: new window.google.maps.Size(iconSize, iconSize),
        anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2),
        zIndex: isHovered || isSelected ? 1000 : isAttached ? 10 : 5,
      };
    },
    [getMosqueRequestStatus]
  );

  // Handle marker click
  const handleMarkerClick = useCallback(
    (mosque) => {
      if (selectedMosque?.id === mosque.id) {
        setSelectedMosque(null);
        setInfoWindowOpen(false);
        return;
      }

      setIsUserInteracting(true);
      setSelectedMosque(mosque);

      // Add a small delay to ensure proper InfoWindow positioning
      setTimeout(() => {
        setInfoWindowOpen(true);
      }, 100);

      // Pan to marker without changing zoom level
      if (mapInstanceRef.current && mosque.location) {
        const currentZoom = mapInstanceRef.current.getZoom();
        const currentCenter = mapInstanceRef.current.getCenter();

        // Calculate if the marker is within the current viewport
        const bounds = mapInstanceRef.current.getBounds();
        const markerLatLng = new window.google.maps.LatLng(
          mosque.location.lat,
          mosque.location.lng
        );

        // Only pan if the marker is not visible in the current viewport
        if (!bounds || !bounds.contains(markerLatLng)) {
          mapInstanceRef.current.panTo({
            lat: mosque.location.lat,
            lng: mosque.location.lng,
          });
        }

        // Ensure zoom level stays the same
        mapInstanceRef.current.setZoom(currentZoom);
      }

      // Reset interaction flag after a short delay
      setTimeout(() => setIsUserInteracting(false), 1000);
    },
    [selectedMosque]
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
    setInfoWindowOpen(false);
    setHoveredMosqueId(null);
  }, []);

  // Map load handler
  const onMapLoad = useCallback((mapInstance) => {
    mapInstanceRef.current = mapInstance; // Store in ref for persistence
    setMap(mapInstance);
    setIsMapLoaded(true);
  }, []);

  // Trigger map fitting when filtered mosques or map state changes
  useEffect(() => {
    if (
      isMapLoaded &&
      mapInstanceRef.current &&
      userLocation &&
      !isUserInteracting
    ) {
      const currentMap = mapInstanceRef.current;

      // Only fit bounds on initial load, not on every mosque filter change
      // This prevents unwanted zoom changes when user is interacting with the map
      if (!mapInstanceRef.current.hasInitialBounds) {
        const bounds = new window.google.maps.LatLngBounds();

        // Extend bounds for all filtered mosques
        filteredMosques.forEach((mosque) => {
          bounds.extend(
            new window.google.maps.LatLng(
              mosque.location.lat,
              mosque.location.lng
            )
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

        // Mark that initial bounds have been set
        mapInstanceRef.current.hasInitialBounds = true;
      }
    }
  }, [isMapLoaded, userLocation, isUserInteracting]); // Removed filteredMosques.length from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No need to explicitly clean up Google Maps as useLoadScript handles it
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
    };
  }, []);

  // Handle "Show all" button click
  const handleShowAllClick = useCallback(() => {
    if (mapInstanceRef.current && isMapLoaded && userLocation) {
      const currentMap = mapInstanceRef.current;
      const currentZoom = currentMap.getZoom();
      const bounds = new window.google.maps.LatLngBounds();

      // Extend bounds for all filtered mosques
      filteredMosques.forEach((mosque) => {
        bounds.extend(
          new window.google.maps.LatLng(
            mosque.location.lat,
            mosque.location.lng
          )
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
        currentMap.setZoom(Math.max(currentZoom, 12)); // Use current zoom or minimum 12
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
    }
  }, [filteredMosques, userLocation, isMapLoaded]);

  // Render cluster marker
  const renderClusterMarker = (clusterer) => {
    const count = clusterer.getCount();
    const size = Math.min(60, 30 + count / 5);
    const svgContent = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 2
    }" fill="#2563EB" fillOpacity="0.8"/>
        <text x="${size / 2}" y="${
      size / 2
    }" text-anchor="middle" dy=".3em" fill="white" font-size="${
      size / 3
    }" font-family="sans-serif">${count}</text>
      </svg>
    `;

    return new window.google.maps.Marker({
      position: clusterer.getPosition(),
      icon: {
        url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size / 2, size / 2),
      },
      zIndex: 100,
    });
  };

  // Render InfoWindow content
  const renderInfoWindowContent = useCallback(
    (mosque) => {
      const isAttached = attachedMosqueIds.has(mosque.id);
      const requestStatus = getMosqueRequestStatus(mosque);

      // Determine button text and behavior based on request status
      let buttonText = "Add to Selection";
      let buttonClass =
        "mt-2 text-sm text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-md w-full transition-colors duration-150";
      let buttonDisabled = false;

      if (requestStatus === "approved") {
        buttonText = "Approved ✓";
        buttonClass =
          "mt-2 text-sm text-white bg-green-600 px-4 py-2 rounded-md w-full transition-colors duration-150 cursor-not-allowed opacity-75";
        buttonDisabled = true;
      } else if (requestStatus === "denied") {
        buttonText = "Denied ✗";
        buttonClass =
          "mt-2 text-sm text-white bg-red-600 px-4 py-2 rounded-md w-full transition-colors duration-150 cursor-not-allowed opacity-75";
        buttonDisabled = true;
      } else if (requestStatus === "pending") {
        buttonText = "Request Pending...";
        buttonClass =
          "mt-2 text-sm text-white bg-orange-600 px-4 py-2 rounded-md w-full transition-colors duration-150 cursor-not-allowed opacity-75";
        buttonDisabled = true;
      } else if (isAttached) {
        buttonText = "Remove from Selection";
        buttonClass =
          "mt-2 text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md w-full transition-colors duration-150";
      } else {
        buttonText = "Add to Selection";
        buttonClass =
          "mt-2 text-sm text-white bg-blue-700 hover:bg-blue-700 px-4 py-2 rounded-md w-full transition-colors duration-150";
      }

      return (
        <div
          className="bg-white p-5 rounded-xl shadow-xl max-w-xs font-sans flex flex-col items-center justify-center"
          style={{ minWidth: 260 }}
        >
          <h3 className="font-semibold text-lg text-gray-800 mb-1 text-center">
            {mosque.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 text-center">
            {mosque.address}
          </p>

          {/* Distance info */}
          {mosque.distance && (
            <p className="text-xs text-gray-500 mb-2 text-center">
              <MapPin className="inline h-3 w-3 mr-1" />
              {mosque.distance.toFixed(1)} miles away
            </p>
          )}

          {/* Status badges */}
          {mosque.hasFemaleArea && (
            <div className="mt-2 mb-2">
              <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
                Female Prayer Area
              </div>
            </div>
          )}
          {requestStatus === "approved" && (
            <div className="mt-2 mb-2">
              <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
                Request Approved
              </div>
            </div>
          )}
          {requestStatus === "denied" && (
            <div className="mt-2 mb-2">
              <div className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
                Request Denied
              </div>
            </div>
          )}
          {requestStatus === "pending" && (
            <div className="mt-2 mb-2">
              <div className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
                Request Pending
              </div>
            </div>
          )}
          {!requestStatus && isAttached && (
            <div className="mt-2 mb-2">
              <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
                Selected
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => {
              if (!buttonDisabled) {
                toggleMosqueAttachment(mosque);
                handleInfoWindowClose();
              }
            }}
            disabled={buttonDisabled}
            className={buttonClass}
          >
            {buttonText}
          </button>
        </div>
      );
    },
    [
      toggleMosqueAttachment,
      handleInfoWindowClose,
      getMosqueRequestStatus,
      attachedMosqueIds,
    ]
  );

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
    <div
      className="mb-4 relative"
      style={{ width: "100%", height: "100%", minHeight: "400px" }}
    >
      {/* This div will contain the actual map element */}
      <div
        id="google-map-container"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
            minHeight: "400px",
            borderRadius: "8px",
          }}
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
            <MarkerClustererF
              options={CLUSTER_OPTIONS}
              render={renderClusterMarker}
            >
              {(clusterer) =>
                filteredMosques.map((mosque) => {
                  const isCurrentlySelected = selectedMosque?.id === mosque.id;
                  const isCurrentlyHovered = hoveredMosqueId === mosque.id;

                  return (
                    <Marker
                      key={mosque.id}
                      position={mosque.location}
                      onClick={() => toggleMosqueAttachment(mosque)}
                      onMouseOver={() => setHoveredMosqueId(mosque.id)}
                      onMouseOut={() => setHoveredMosqueId(null)}
                      icon={createMarkerIcon(
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
      {/* {isMapLoaded && (
        <div className="absolute bottom-2 right-2 z-10 bg-white p-3 rounded-lg shadow-md text-xs">
          <p className="font-semibold text-gray-700 mb-2">
            Found {filteredMosques.length} mosques within {distance} miles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>No Request</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Denied</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span>Female Area</span>
            </div>
          </div>
        </div>
      )} */}

      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {filteredMosques.length > 0 && isMapLoaded && (
          <button
            type="button"
            onClick={handleShowAllClick}
            className="bg-white p-2 rounded-lg shadow-md text-xs text-blue-600 flex items-center font-semibold hover:bg-gray-50 transition-colors"
            aria-label="Fit map to show all mosques"
          >
            {/* <span>Show all</span> */}
          </button>
        )}
      </div>
    </div>
  );
};

export default MapContainer;

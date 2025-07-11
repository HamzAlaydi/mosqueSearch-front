"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { MarkerClustererF } from "@react-google-maps/api";
import { GOOGLE_API, rootRoute } from "@/shared/constants/backendLink"; // Your Google API key
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "@/redux/user/userSlice";
import axios from "axios";
import toast from "react-hot-toast";

// Constants - Simplified for better performance
const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  // Simplified styles for better performance
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

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }; // London as fallback

// Static libraries array to prevent infinite re-renders
const GOOGLE_MAPS_LIBRARIES = ["geometry"];

export default function OptimizedMosqueMap({
  filteredMosques,
  mapCenter,
  activeFilters,
  allMosques = [],
  onSearchInMosque, // Add this new prop
}) {
  const dispatch = useDispatch();

  // Use shallowEqual for performance optimization
  const { currentUser } = useSelector(
    (state) => ({
      currentUser: state.user.currentUser,
    }),
    shallowEqual
  );

  // States
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredMosqueId, setHoveredMosqueId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showAttachedMosques, setShowAttachedMosques] = useState(false); // State to toggle showing only attached mosques
  const [searchedMosqueIds, setSearchedMosqueIds] = useState(new Set());
  const [loadError, setLoadError] = useState(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const mapRef = useRef(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!currentUser && userString) {
      try {
        const user = JSON.parse(userString);
        const userId = user.id; // or user._id based on your backend
        if (userId) {
          dispatch(fetchUserProfile(userId));
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, [dispatch, currentUser]);

  // Calculate distance radius in meters
  const distanceRadiusMeters = useMemo(() => {
    const distanceMiles =
      typeof activeFilters?.distance === "number" ? activeFilters.distance : 10;
    return distanceMiles * 1609.34; // Convert miles to meters
  }, [activeFilters?.distance]);

  // Create a set of attached mosque IDs for quick lookup (normalize to string)
  const attachedMosqueIds = useMemo(() => {
    const ids = (currentUser?.attachedMosques || [])
      .map((m) => String(m.id || m._id || m.externalId))
      .filter(Boolean);
    console.log("Current user:", currentUser);
    console.log("Attached mosque IDs:", ids);
    return new Set(ids);
  }, [currentUser?.attachedMosques]);

  // Process mosque data for display (normalize IDs to string)
  const processedMosques = useMemo(() => {
    try {
      let sourceMosques = showAttachedMosques
        ? currentUser?.attachedMosques || []
        : allMosques;
      if (!showAttachedMosques && filteredMosques?.length > 0) {
        sourceMosques = filteredMosques;
      } else if (!showAttachedMosques && !filteredMosques?.length) {
        sourceMosques = allMosques;
      }
      return sourceMosques
        .map((mosque) => {
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
          const normalizedId = String(
            mosque._id ||
              mosque.id ||
              mosque.externalId ||
              Math.random().toString(36).substr(2, 9)
          );
          return {
            ...mosque,
            id: normalizedId,
            location: { lat, lng },
            hasFemaleArea:
              mosque.facilities?.includes("Female Prayer Area") ||
              mosque.femaleArea ||
              false,
            isAttached: attachedMosqueIds.has(normalizedId),
          };
        })
        .filter(
          (mosque) =>
            mosque.location &&
            typeof mosque.location.lat === "number" &&
            typeof mosque.location.lng === "number" &&
            !isNaN(mosque.location.lat) &&
            !isNaN(mosque.location.lng)
        );
    } catch (error) {
      console.error("Error processing mosque data:", error);
      return [];
    }
  }, [
    allMosques,
    filteredMosques,
    currentUser?.attachedMosques,
    attachedMosqueIds,
    showAttachedMosques,
  ]);

  // Apply distance filtering (only if not showing attached mosques)
  const mosquesToDisplay = useMemo(() => {
    if (
      showAttachedMosques || // Don't apply distance filter when showing attached
      !mapCenter ||
      !isLoaded ||
      !window.google?.maps ||
      !processedMosques.length ||
      distanceRadiusMeters <= 0
    ) {
      return processedMosques;
    }

    const center = new window.google.maps.LatLng(mapCenter.lat, mapCenter.lng);
    return processedMosques.filter((mosque) => {
      const mosqueLocation = new window.google.maps.LatLng(
        mosque.location.lat,
        mosque.location.lng
      );
      // Distance calculation using Google Maps geometry library
      const distance =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          center,
          mosqueLocation
        );
      return distance <= distanceRadiusMeters;
    });
  }, [
    processedMosques,
    mapCenter,
    distanceRadiusMeters,
    isLoaded,
    showAttachedMosques,
  ]);

  // Create marker icons
  // 1. Modified createMarkerIcon function with professional mosque icon
  // Modified createMarkerIcon function with search indicator
  const createMarkerIcon = useCallback(
    (mosque, isHovered, isSelected) => {
      const isAttached = mosque.isAttached;
      const hasFemaleArea = mosque.hasFemaleArea;
      const hasBeenSearched = searchedMosqueIds.has(mosque.id); // Add this line

      const baseColor = isAttached
        ? "#F59E0B" // Gold/Orange
        : hasFemaleArea
        ? "#8B5CF6" // Purple
        : "#2563EB"; // Blue

      const hoverColor = isAttached
        ? "#D97706"
        : hasFemaleArea
        ? "#7C3AED"
        : "#1D4ED8";

      const selectedColor = "#10B981"; // Green

      const currentColor = isSelected
        ? selectedColor
        : isHovered
        ? hoverColor
        : baseColor;

      const iconSize = isHovered || isSelected ? 44 : 40;
      const mosqueSize = isHovered || isSelected ? 24 : 20;

      // Professional mosque icon SVG
      const svgContent = `
  <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Background circle -->
    <circle cx="24" cy="24" r="22" fill="${currentColor}" stroke="white" stroke-width="2"/>
    
    <!-- Mosque icon -->
    <g transform="translate(${24 - mosqueSize / 2}, ${24 - mosqueSize / 2})">
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
    ${
      hasBeenSearched
        ? `<circle cx="10" cy="38" r="5" fill="#10B981" stroke="white" stroke-width="1"/>
           <path d="M7 38 L9 40 L13 36" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        : ""
    }
  </svg>
`;

      return {
        url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
        scaledSize: new window.google.maps.Size(iconSize, iconSize),
        anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2),
        zIndex:
          isHovered || isSelected
            ? 1000
            : isAttached
            ? 10
            : hasBeenSearched
            ? 8
            : 5, // Add higher zIndex for searched mosques
      };
    },
    [searchedMosqueIds]
  ); // Add searchedMosqueIds to dependencies

  // Fit map to bounds
  const fitMapToBounds = useCallback(() => {
    if (!map || !isLoaded || !window.google?.maps) return;

    try {
      if (showAttachedMosques && processedMosques.length > 0) {
        // Fit to attached mosques
        const bounds = new window.google.maps.LatLngBounds();
        processedMosques.forEach((mosque) => {
          bounds.extend(
            new window.google.maps.LatLng(
              mosque.location.lat,
              mosque.location.lng
            )
          );
        });

        // Avoid zooming to a single point if only one mosque is attached
        if (processedMosques.length === 1) {
          map.setCenter(
            new window.google.maps.LatLng(
              processedMosques[0].location.lat,
              processedMosques[0].location.lng
            )
          );
          map.setZoom(15); // A reasonable zoom level for a single marker
        } else {
          map.fitBounds(bounds, 50); // 50px padding
        }
      } else if (mapCenter && distanceRadiusMeters > 0) {
        // Fit to radius circle around the map center
        const circle = new window.google.maps.Circle({
          center: mapCenter,
          radius: distanceRadiusMeters,
        });

        map.fitBounds(circle.getBounds(), 50);
      } else if (mapCenter) {
        // Just set center if no radius or attached mosques
        map.setCenter(mapCenter);
        map.setZoom(13); // Default zoom if no bounds to fit
      } else {
        // Fallback to default center if no mapCenter
        map.setCenter(DEFAULT_CENTER);
        map.setZoom(13);
      }
    } catch (error) {
      console.error("Error fitting map to bounds:", error);
      // Fallback in case of error
      map.setCenter(mapCenter || DEFAULT_CENTER);
      map.setZoom(13);
    }
  }, [
    map,
    isLoaded,
    mapCenter,
    distanceRadiusMeters,
    processedMosques,
    showAttachedMosques,
  ]);

  // Handle InfoWindow close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMosque(null);
    setInfoWindowOpen(false);
    setHoveredMosqueId(null); // Also clear hover state on close
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (mosque) => {
      if (selectedMosque?.id === mosque.id) {
        handleInfoWindowClose();
        return;
      }

      setIsUserInteracting(true);
      setSelectedMosque(mosque);
      setInfoWindowOpen(true);

      // Pan to the marker location without changing zoom
      if (map && mosque.location) {
        const currentZoom = map.getZoom();
        map.panTo({
          lat: mosque.location.lat,
          lng: mosque.location.lng,
        });
        // Preserve the current zoom level
        map.setZoom(currentZoom);
      }

      // Reset interaction flag after a short delay
      setTimeout(() => setIsUserInteracting(false), 1000);
    },
    [map, selectedMosque, handleInfoWindowClose]
  );

  // Handle mosque attachment/detachment
  const handleAttachToggle = useCallback(
    async (mosque) => {
      if (!currentUser) {
        setFeedbackMessage({
          type: "error",
          message: "Please log in to manage mosque attachments",
        });
        setTimeout(() => setFeedbackMessage(null), 3000);
        return;
      }

      setIsUserInteracting(true);

      // Use the pre-calculated set for efficient lookup
      const isAlreadyAttached =
        attachedMosqueIds.has(mosque.id) || attachedMosqueIds.has(mosque._id);

      setFeedbackMessage({
        type: "loading",
        message: isAlreadyAttached
          ? "Detaching from mosque..."
          : "Attaching to mosque...",
      });

      try {
        // Get auth token from localStorage directly
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Use the mosque's externalId (numeric id from allMosquesInLondon) or _id (for database mosques)
        const mosqueIdentifier = mosque.externalId || mosque.id || mosque._id;

        console.log("Sending mosque attachment request:", {
          mosqueId: mosqueIdentifier,
          mosqueData: {
            name: mosque.name,
            address: mosque.address,
            location: mosque.location,
            externalId: mosque.id || mosque.externalId,
          },
        });

        // Use the new mosque attachment API
        const response = await axios.post(
          `${rootRoute}/mosque-attachments/request`,
          {
            mosqueId: mosqueIdentifier,
            mosqueData: {
              name: mosque.name,
              address: mosque.address,
              location: mosque.location,
              externalId: mosque.id || mosque.externalId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setFeedbackMessage({
            type: "success",
            message: response.data.message,
          });

          // Re-fetch user profile to ensure attachedMosques are up-to-date in the state
          if (currentUser?._id || currentUser?.id) {
            dispatch(fetchUserProfile(currentUser._id || currentUser.id));
          }

          // Automatically refresh the page after a short delay to update the UI
          setTimeout(() => {
            setFeedbackMessage(null);
            handleInfoWindowClose(); // Close InfoWindow after action
            setIsUserInteracting(false); // Reset interaction flag
            // Refresh the page to update all components
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(
            response.data.message || "Failed to update mosque attachment"
          );
        }
      } catch (error) {
        console.error("Failed to update mosque attachment:", error);

        setFeedbackMessage({
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to update mosque attachment. Please try again.",
        });

        setTimeout(() => {
          setFeedbackMessage(null);
          setIsUserInteracting(false); // Reset interaction flag
        }, 3000);
      }
    },
    [dispatch, currentUser, attachedMosqueIds, handleInfoWindowClose]
  );

  const handleSearchInMosque = useCallback(
    (mosque) => {
      // Add mosque to searched set
      setSearchedMosqueIds((prev) => new Set([...prev, mosque.id]));

      // Call the parent component's function to trigger search by mosque
      if (onSearchInMosque) {
        onSearchInMosque(mosque);
      }

      // Close the InfoWindow after triggering search
      handleInfoWindowClose();
    },
    [onSearchInMosque, handleInfoWindowClose]
  );
  // Render InfoWindow content
  const renderInfoWindowContent = useCallback(
    (mosque) => {
      console.log({ mosque });

      const isAttached = mosque.isAttached;
      const hasBeenSearched = searchedMosqueIds.has(mosque.id);

      return (
        <div className="p-2 max-w-xs font-sans text-gray-800">
          <h3 className="font-semibold text-lg mb-1">{mosque.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{mosque.address}</p>

          {/* Facilities badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {mosque.hasFemaleArea && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Female Prayer Area
              </span>
            )}
            {isAttached && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                Your Mosque
              </span>
            )}
          </div>

          {/* Attach/Detach Button */}
          {currentUser && (
            <button
              onClick={() => handleAttachToggle(mosque)}
              className={`mt-2 text-sm !text-white px-4 py-2 rounded-md w-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                isAttached
                  ? "!bg-red-600 hover:!bg-red-700 focus:!ring-red-500"
                  : "!bg-emerald-600 hover:!bg-emerald-700 focus:!ring-emerald-500"
              }`}
            >
              {isAttached ? "Detach from Mosque" : "Attach to Mosque"}
            </button>
          )}

          {/* Search Users in This Mosque Button - UPDATED with visual feedback */}
          {/* <button
            onClick={() => handleSearchInMosque(mosque)}
            className={`mt-2 text-sm px-4 py-2 rounded-md w-full transition-all duration-150 focus:outline-none focus:ring-2 ${
              hasBeenSearched
                ? "!bg-gray-500 !text-white hover:!bg-gray-600 focus:!ring-gray-400 opacity-75"
                : "!text-white !bg-blue-600 hover:!bg-blue-700 focus:!ring-blue-400"
            }`}
          >
            {hasBeenSearched ? "✓ Users Searched" : "Find Users in This Mosque"}
          </button> */}
        </div>
      );
    },
    [currentUser, handleAttachToggle, handleSearchInMosque, searchedMosqueIds]
  );

  // Map load handlers
  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
    setIsLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
    setIsLoaded(false);
  }, []);

  // Script loading handlers
  const onScriptLoad = useCallback(() => {
    setLoadError(null);
  }, []);

  const onScriptError = useCallback((error) => {
    console.error("Google Maps script loading error:", error);
    setLoadError(error);
  }, []);

  // Update map when data changes or filters are applied
  useEffect(() => {
    if (isLoaded && map && !isUserInteracting) {
      fitMapToBounds();
    }
  }, [
    isLoaded,
    map,
    fitMapToBounds,
    mosquesToDisplay.length, // Re-fit when the list of displayed mosques changes
    showAttachedMosques, // Re-fit when toggling between all/attached
    mapCenter, // Re-fit if map center changes
    distanceRadiusMeters, // Re-fit if radius changes
  ]);

  // Cluster options
  const clusterOptions = {
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
        // Adjust text anchor for centering text
        anchorText: [0, 5], // [x, y] offset in pixels
      },
    ],
    // Ensure cluster markers are clickable and open InfoWindow/handle events
    clickable: true,
  };

  // Custom render function for clusters to include count
  const renderClusterMarker = (clusterer) => {
    const count = clusterer.getCount();
    const size = Math.min(60, 30 + count / 5); // Scale size based on count, with a max
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
      label: {
        text: "", // Text is inside the SVG
        color: "white",
        fontSize: `${size / 3}px`,
        fontWeight: "bold",
        className: "cluster-marker-label", // Optional: for custom CSS
      },
      zIndex: 100, // Keep clusters on top
    });
  };

  // Add debug log for currentUser
  useEffect(() => {
    console.log("Current user in map:", currentUser);
  }, [currentUser]);

  // Show error state if script failed to load
  if (loadError) {
    return (
      <div className="sticky top-20 h-[calc(100vh-100px)] shadow-inner relative flex-grow">
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-6">
            <div className="text-red-600 font-semibold mb-2">
              Map Loading Error
            </div>
            <div className="text-gray-600 text-sm mb-4">
              Failed to load Google Maps. Please refresh the page to try again.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-20 h-[calc(100vh-100px)] shadow-inner relative flex-grow">
      {/* Map container */}
      <div style={{ width: "100%", height: "100%" }}>
        <LoadScript
          googleMapsApiKey={GOOGLE_API}
          libraries={GOOGLE_MAPS_LIBRARIES}
          onLoad={onScriptLoad}
          onError={onScriptError}
          loadingElement={
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="text-blue-600 font-semibold flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading map...
              </div>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={mapCenter || DEFAULT_CENTER} // Use mapCenter if available, otherwise fallback
            zoom={mapCenter ? 13 : 13} // Initial zoom level (will be adjusted by fitBounds)
            options={MAP_OPTIONS}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleInfoWindowClose} // Close InfoWindow when clicking on the map
          >
            {/* Render the Circle if not showing attached mosques and radius is set */}
            {isLoaded &&
              mapCenter &&
              !showAttachedMosques &&
              distanceRadiusMeters > 0 && (
                <Circle
                  center={mapCenter}
                  radius={distanceRadiusMeters}
                  options={CIRCLE_OPTIONS}
                />
              )}

            {/* Render Markers with Clustering */}
            {isLoaded && (
              <MarkerClustererF
                options={clusterOptions}
                render={renderClusterMarker}
              >
                {(clusterer) =>
                  mosquesToDisplay.map((mosque) => {
                    const isCurrentlySelected =
                      selectedMosque?.id === mosque.id;
                    const isCurrentlyHovered = hoveredMosqueId === mosque.id;

                    return (
                      <Marker
                        key={mosque.id}
                        position={{
                          lat: mosque.location.lat,
                          lng: mosque.location.lng,
                        }}
                        onClick={() => handleMarkerClick(mosque)}
                        onMouseOver={() => setHoveredMosqueId(mosque.id)}
                        onMouseOut={() => setHoveredMosqueId(null)}
                        icon={createMarkerIcon(
                          mosque,
                          isCurrentlyHovered,
                          isCurrentlySelected
                        )}
                        clusterer={clusterer} // Assign to the clusterer
                      />
                    );
                  })
                }
              </MarkerClustererF>
            )}

            {/* InfoWindow */}
            {infoWindowOpen && selectedMosque && (
              <InfoWindow
                position={{
                  lat: selectedMosque.location.lat,
                  lng: selectedMosque.location.lng,
                }}
                onCloseClick={handleInfoWindowClose}
                options={{
                  // Adjust the pixelOffset if needed to position the InfoWindow correctly above the marker icon
                  pixelOffset: new window.google.maps.Size(0, -45), // Adjust Y based on marker icon height
                }}
              >
                {renderInfoWindowContent(selectedMosque)}
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-lg text-sm font-semibold z-20 ${
            // Higher z-index to be on top
            feedbackMessage.type === "success"
              ? "bg-green-500 text-white"
              : feedbackMessage.type === "error"
              ? "bg-red-500 text-white"
              : feedbackMessage.type === "warning"
              ? "bg-yellow-500 text-gray-800"
              : "bg-blue-500 text-white" // Loading or info
          }`}
        >
          {feedbackMessage.message}
        </div>
      )}

      {/* Controls */}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white p-3 rounded-md shadow-md">
        <div className="text-xs font-semibold mb-2">Legend</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
          <span className="text-xs">Standard Mosque</span>
        </div>

        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
          <span className="text-xs">My Mosque</span>
        </div>
        {/* Add Selected/Hovered states to legend if desired */}
        <div className="flex items-center mt-2">
          <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
          <span className="text-xs">Selected Mosque</span>
        </div>
      </div>
    </div>
  );
}

// ActiveFilters component (remains unchanged as it's not the source of the map performance issue)
import { X } from "lucide-react";

const FilterTag = ({ category, value, removeFilter }) => (
  <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1 text-sm">
    {value}
    <button
      onClick={() => removeFilter(category, value)}
      className="ml-1 text-gray-500 hover:text-gray-700"
    >
      <X size={16} />
    </button>
  </div>
);

export function ActiveFilters({
  activeFilters,
  removeFilter,
  clearAllFilters,
}) {
  // Skip rendering if no active filters
  if (
    activeFilters.prayer.length === 0 &&
    activeFilters.facilities.length === 0 &&
    !activeFilters.rating &&
    !activeFilters.distance
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {activeFilters.prayer.map((prayer) => (
        <FilterTag
          key={`prayer-${prayer}`}
          category="prayer"
          value={prayer}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.facilities.map((facility) => (
        <FilterTag
          key={`facility-${facility}`}
          category="facilities"
          value={facility}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.rating && (
        <FilterTag
          category="rating"
          value={`${activeFilters.rating}+ Stars`}
          removeFilter={removeFilter}
        />
      )}

      {activeFilters.distance && (
        <FilterTag
          category="distance"
          value={`Within ${activeFilters.distance} miles`}
          removeFilter={removeFilter}
        />
      )}

      <button
        onClick={clearAllFilters}
        className="text-primary hover:underline text-sm ml-2"
      >
        Clear all
      </button>
    </div>
  );
}

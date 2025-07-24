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
import { OverlayView } from "@react-google-maps/api";
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
  const [justAttachedOrDetached, setJustAttachedOrDetached] = useState(false);
  const mapRef = useRef(null);

  // Track current zoom level
  const [currentZoom, setCurrentZoom] = useState(13); // Default zoom value

  // Track hovered label for z-index
  const [hoveredLabelId, setHoveredLabelId] = useState(null);

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

  // Remove debounce for effectiveDistance
  const [effectiveDistance, setEffectiveDistance] = useState(
    typeof activeFilters?.distance === "number" ? activeFilters.distance : 10
  );

  // Update effectiveDistance immediately on distance change
  useEffect(() => {
    setEffectiveDistance(
      typeof activeFilters?.distance === "number" ? activeFilters.distance : 10
    );
  }, [activeFilters?.distance]);

  // Add debouncedDistance state
  const [debouncedDistance, setDebouncedDistance] = useState(effectiveDistance);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDistance(effectiveDistance);
    }, 200); // 200ms debounce
    return () => clearTimeout(handler);
  }, [effectiveDistance]);

  // Map distance to zoom level (example: 1 mile = 14, 5 = 13, 10 = 12, 20 = 11, 50+ = 10)
  function getZoomForDistance(distance) {
    if (distance <= 2) return 14;
    if (distance <= 5) return 13;
    if (distance <= 10) return 12;
    if (distance <= 20) return 11;
    if (distance <= 50) return 10;
    return 9;
  }

  // Use debouncedDistance for all map operations
  const distanceRadiusMeters = useMemo(
    () => debouncedDistance * 1609.34,
    [debouncedDistance]
  );
  const zoom = getZoomForDistance(debouncedDistance);

  // Update map zoom when debouncedDistance changes
  useEffect(() => {
    if (map && mapCenter) {
      map.setZoom(zoom);
      map.panTo(mapCenter);
    }
  }, [debouncedDistance, map, mapCenter, zoom]);
  // --- END NEW ---

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

  // REMOVE fitMapToBounds and all related logic
  // Remove the fitMapToBounds function entirely
  // Remove the useEffect that calls fitMapToBounds
  // In the <GoogleMap> component, set zoom to a fixed value (e.g., 13) and do not change it programmatically

  // Handle InfoWindow close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMosque(null);
    setInfoWindowOpen(false);
    setHoveredMosqueId(null); // Also clear hover state on close
  }, []);

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
      setJustAttachedOrDetached(true); // Prevent zoom change on next update

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

          // Automatically update UI after a short delay (no reload)
          setTimeout(() => {
            setFeedbackMessage(null);
            handleInfoWindowClose(); // Close InfoWindow after action
            setIsUserInteracting(false); // Reset interaction flag
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

  // On marker click, immediately attach/detach the mosque
  const handleMarkerClick = useCallback(
    (mosque) => {
      handleAttachToggle(mosque);
    },
    [handleAttachToggle]
  );

  // Render InfoWindow content
  const renderInfoWindowContent = useCallback(
    (mosque) => {
      const isAttached = mosque.isAttached;
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
        </div>
      );
    },
    [searchedMosqueIds]
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
    if (justAttachedOrDetached) {
      setJustAttachedOrDetached(false); // Reset the flag, skip fitMapToBounds this time
      return;
    }
    // REMOVE fitMapToBounds and all related logic
    // Remove the fitMapToBounds function entirely
    // Remove the useEffect that calls fitMapToBounds
    // In the <GoogleMap> component, set zoom to a fixed value (e.g., 13) and do not change it programmatically
  }, [
    isLoaded,
    map,
    // REMOVE fitMapToBounds and all related logic
    // Remove the fitMapToBounds function entirely
    // Remove the useEffect that calls fitMapToBounds
    // In the <GoogleMap> component, set zoom to a fixed value (e.g., 13) and do not change it programmatically
    mosquesToDisplay.length, // Re-fit when the list of displayed mosques changes
    showAttachedMosques, // Re-fit when toggling between all/attached
    mapCenter, // Re-fit if map center changes
    distanceRadiusMeters, // Re-fit if radius changes
    justAttachedOrDetached, // Add as dependency
  ]);

  // Update currentZoom when map zoom changes
  const handleZoomChanged = useCallback(() => {
    if (map) {
      setCurrentZoom(map.getZoom());
    }
  }, [map]);

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

  // --- ZOOM BUTTONS ---
  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };
  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

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
            zoom={zoom} // Initial zoom level (will be adjusted by fitBounds)
            options={MAP_OPTIONS}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleInfoWindowClose} // Close InfoWindow when clicking on the map
            onZoomChanged={handleZoomChanged}
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
                      <>
                        <Marker
                          key={mosque.id}
                          position={{
                            lat: mosque.location.lat,
                            lng: mosque.location.lng,
                          }}
                          onClick={() => handleMarkerClick(mosque)}
                          onMouseOver={() => {
                            setHoveredMosqueId(mosque.id);
                            setSelectedMosque(mosque);
                            setInfoWindowOpen(true);
                          }}
                          onMouseOut={() => {
                            setHoveredMosqueId(null);
                            setSelectedMosque(null);
                            setInfoWindowOpen(false);
                          }}
                          icon={createMarkerIcon(
                            mosque,
                            isCurrentlyHovered,
                            isCurrentlySelected
                          )}
                          clusterer={clusterer} // Assign to the clusterer
                        />
                        {/* Mosque name label when zoomed in */}
                        {currentZoom >= 15 && (
                          <OverlayView
                            position={{
                              lat: mosque.location.lat,
                              lng: mosque.location.lng,
                            }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                          >
                            <div
                              style={{
                                background: "none",
                                color: "#d32f2f",
                                fontWeight: 700,
                                fontSize: "13px",
                                fontFamily:
                                  "Segoe UI, Roboto, Arial, sans-serif",
                                whiteSpace: "nowrap",
                                marginLeft: 22,
                                marginTop: -8,
                                display: "inline-block",
                                padding: 0,
                                border: "none",
                                boxShadow: "none",
                                letterSpacing: "0.01em",
                                textShadow:
                                  "0 1px 0 #fff, 0 1.5px 2px rgba(0,0,0,0.08)",
                                zIndex:
                                  hoveredLabelId === mosque.id ? 9999 : 1000,
                              }}
                              onMouseEnter={() => setHoveredLabelId(mosque.id)}
                              onMouseLeave={() => setHoveredLabelId(null)}
                            >
                              {mosque.name}
                            </div>
                          </OverlayView>
                        )}
                      </>
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

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-2xl font-bold border border-gray-300 hover:bg-gray-100 focus:outline-none"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-2xl font-bold border border-gray-300 hover:bg-gray-100 focus:outline-none"
          aria-label="Zoom out"
        >
          −
        </button>
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
    </div>
  );
}
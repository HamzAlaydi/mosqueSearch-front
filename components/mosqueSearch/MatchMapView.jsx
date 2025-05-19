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
import { GOOGLE_API } from "@/shared/constants/backendLink"; // Your Google API key
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "@/redux/user/userSlice";

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

export default function OptimizedMosqueMap({
  filteredMosques,
  mapCenter,
  activeFilters,
  allMosques = [],
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

  // Create a set of attached mosque IDs for quick lookup
  const attachedMosqueIds = useMemo(() => {
    return new Set(
      currentUser?.attachedMosques?.map((m) => m.id || m._id).filter(Boolean) ||
        []
    );
  }, [currentUser?.attachedMosques]);

  // Process mosque data for display
  const processedMosques = useMemo(() => {
    try {
      // Pick the source data based on current filter
      let sourceMosques = showAttachedMosques
        ? currentUser?.attachedMosques || []
        : allMosques; // Default to allMosques if not showing attached

      // Apply standard filtering if not showing attached mosques and filteredMosques is available
      if (!showAttachedMosques && filteredMosques?.length > 0) {
        sourceMosques = filteredMosques;
      } else if (!showAttachedMosques && !filteredMosques?.length) {
        // If not showing attached and no filtered mosques, use all mosques
        sourceMosques = allMosques;
      }

      // Process each mosque to ensure it has the required properties
      return (
        sourceMosques
          .map((mosque) => {
            // Handle both {lat, lng} and GeoJSON formats
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

            return {
              ...mosque,
              // Ensure a unique ID for map keys and lookups
              id:
                mosque._id ||
                mosque.id ||
                Math.random().toString(36).substr(2, 9),
              location: { lat, lng },
              hasFemaleArea:
                mosque.facilities?.includes("Female Prayer Area") ||
                mosque.femaleArea || // Assuming 'femaleArea' might be a boolean flag
                false,
              isAttached:
                attachedMosqueIds.has(mosque._id) ||
                attachedMosqueIds.has(mosque.id),
            };
          })
          // Filter out mosques with invalid or missing location data
          .filter(
            (mosque) =>
              mosque.location &&
              typeof mosque.location.lat === "number" &&
              typeof mosque.location.lng === "number" &&
              !isNaN(mosque.location.lat) && // Ensure coordinates are not NaN
              !isNaN(mosque.location.lng)
          )
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
  const createMarkerIcon = useCallback((mosque, isHovered, isSelected) => {
    // Female mosque - Purple
    // Attached mosque - Gold/Orange
    // Normal mosque - Blue
    const isAttached = mosque.isAttached;
    const hasFemaleArea = mosque.hasFemaleArea;

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

    const iconSize = isHovered || isSelected ? 40 : 36;

    const svgContent = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 48C24 48 40 32 40 19C40 10.1634 32.8366 3 24 3C15.1634 3 8 10.1634 8 19C8 32 24 48 24 48Z" fill="${currentColor}" stroke="white" stroke-width="2"/>
        <circle cx="24" cy="19" r="7" fill="white"/>
        ${
          hasFemaleArea
            ? `<circle cx="24" cy="19" r="3" fill="${baseColor}"/>`
            : ""
        }
        ${
          isAttached
            ? `<path d="M24 24 L20 30 L28 30 L24 24 Z" fill="white"/>`
            : ""
        }
      </svg>
    `;

    return {
      url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
      scaledSize: new window.google.maps.Size(iconSize, iconSize),
      anchor: new window.google.maps.Point(iconSize / 2, iconSize),
      zIndex: isHovered || isSelected ? 1000 : isAttached ? 10 : 5,
    };
  }, []);

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

      setSelectedMosque(mosque);
      setInfoWindowOpen(true);

      // Pan to the marker location
      if (map && mosque.location) {
        map.panTo({
          lat: mosque.location.lat,
          lng: mosque.location.lng,
        });
      }
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

      // Use the pre-calculated set for efficient lookup
      const isAlreadyAttached =
        attachedMosqueIds.has(mosque.id) || attachedMosqueIds.has(mosque._id);

      let updatedAttachedMosques;

      if (isAlreadyAttached) {
        // Detach the mosque
        updatedAttachedMosques = (currentUser.attachedMosques || []).filter(
          // Filter using both id and _id to ensure removal regardless of how it was stored
          (m) =>
            m.id !== mosque.id &&
            m.id !== mosque._id &&
            m._id !== mosque.id &&
            m._id !== mosque._id
        );

        setFeedbackMessage({
          type: "loading",
          message: "Detaching from mosque...",
        });
      } else {
        // If the mosque is NOT already attached, construct the new list including it
        const mosqueDataForAttachment = {
          // Prefer _id if available, otherwise use id
          id: mosque._id || mosque.id,
          _id: mosque._id || mosque.id, // Store both if possible, or pick one consistently
          name: mosque.name,
          address: mosque.address,
          // Store location in GeoJSON format if possible
          location: mosque.location
            ? {
                type: "Point",
                coordinates: [mosque.location.lng, mosque.location.lat],
              }
            : null,
          // Include femaleArea if it exists
          ...(typeof mosque.femaleArea !== "undefined" && {
            femaleArea: mosque.femaleArea,
          }),
          // Include facilities if it exists
          ...(Array.isArray(mosque.facilities) && {
            facilities: mosque.facilities,
          }),
        };

        // Construct the new array by ensuring the current mosque isn't already in the list
        // This is the key change to prevent duplicates
        updatedAttachedMosques = [
          ...(currentUser.attachedMosques || []).filter(
            // Filter out the mosque if it somehow exists in the current list already
            (m) =>
              m.id !== mosqueDataForAttachment.id &&
              m.id !== mosqueDataForAttachment._id &&
              m._id !== mosqueDataForAttachment.id &&
              m._id !== mosqueDataForAttachment._id
          ),
          mosqueDataForAttachment, // Add the mosque
        ];

        setFeedbackMessage({
          type: "loading",
          message: "Attaching to mosque...",
        });
      }

      try {
        // Dispatch the update user profile action with the potentially updated list
        await dispatch(
          updateUserProfile({ attachedMosques: updatedAttachedMosques })
        ).unwrap();

        setFeedbackMessage({
          type: "success",
          message: isAlreadyAttached // Use the initial check result for the message
            ? "Successfully detached from mosque!"
            : "Successfully attached to mosque!",
        });

        // Re-fetch user profile to ensure attachedMosques are up-to-date in the state
        // This is important to refresh the attachedMosqueIds memoized set
        if (currentUser?._id || currentUser?.id) {
          dispatch(fetchUserProfile(currentUser._id || currentUser.id));
        }

        setTimeout(() => setFeedbackMessage(null), 3000);
        handleInfoWindowClose(); // Close InfoWindow after action
      } catch (error) {
        console.error("Failed to update mosque attachment:", error);

        setFeedbackMessage({
          type: "error",
          message:
            error.message ||
            "Failed to update mosque attachment. Please try again.",
        });

        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    },
    [dispatch, currentUser, attachedMosqueIds, handleInfoWindowClose] // Include attachedMosqueIds in dependencies
  );

  // Render InfoWindow content
  const renderInfoWindowContent = useCallback(
    (mosque) => {
      console.log({ mosque });

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
            {/* Add other facility badges here if needed */}
            {/* Example: mosque.facilities?.includes("Parking") && (...) */}
          </div>

          {/* Attach/Detach Button */}
          {console.log({ currentUser })}
          {currentUser && (
            <button
              onClick={() => handleAttachToggle(mosque)}
              // Apply appropriate classes based on attachment status
              className={`mt-2 text-sm text-black  px-4 py-2 rounded-md w-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                isAttached
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              }`}
            >
              {isAttached ? "Detach from Mosque" : "Attach to Mosque"}
            </button>
          )}

          {/* View Details Button */}
          {/* Replace with actual navigation or modal logic */}
          <button
            onClick={() => alert(`View details for ${mosque.name}`)}
            className="mt-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md w-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            View Details
          </button>
        </div>
      );
    },
    [currentUser, handleAttachToggle]
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

  // Update map when data changes or filters are applied
  useEffect(() => {
    if (isLoaded && map) {
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

  return (
    <div className="sticky top-20 h-[calc(100vh-100px)] shadow-inner relative flex-grow">
      {/* Map container */}
      <div style={{ width: "100%", height: "100%" }}>
        <LoadScript
          googleMapsApiKey={GOOGLE_API}
          libraries={["geometry"]} // geometry library is needed for computeDistanceBetween
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
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Toggle My Mosques Button */}
        {currentUser && ( // Only show button if user is logged in
          <button
            onClick={() => setShowAttachedMosques(!showAttachedMosques)}
            className={`px-4 py-2 rounded-md shadow-md text-sm font-semibold transition-colors duration-150 ${
              showAttachedMosques
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-white text-blue-600 hover:bg-blue-100"
            }`}
          >
            {showAttachedMosques ? "Show All Mosques" : "Show My Mosques"}
          </button>
        )}

        {/* Add other controls here if needed */}
      </div>

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

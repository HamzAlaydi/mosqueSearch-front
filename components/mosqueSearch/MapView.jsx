"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { GOOGLE_API } from "@/shared/constants/backendLink";
import { Loader2, Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";

// Constants
const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "calc(100vh - 100px)",
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#777777" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#d3d3d3" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#f5f5f5" }],
    },
  ],
};

const CIRCLE_OPTIONS = {
  strokeColor: "#3B82F6",
  strokeOpacity: 0.9,
  strokeWeight: 2.5,
  fillColor: "#3B82F6",
  fillOpacity: 0.15,
  clickable: false,
  zIndex: 1,
};

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }; // London as fallback
const MAX_MOSQUES_TO_DISPLAY = 500; // Maximum number of mosques to display

const getSafeMosqueData = (mosque) => ({
  ...mosque,
  id: mosque.id || Math.random().toString(36).substr(2, 9),
  location: mosque.location || { lat: 0, lng: 0 },
  rating: mosque.rating || 0,
  reviewCount: mosque.reviewCount || 0,
  upcomingPrayer: mosque.upcomingPrayer || { name: "N/A", time: "" },
  hasFemaleArea:
    mosque.facilities?.includes("Female Prayer Area") ||
    mosque.femaleArea ||
    false,
});

// Calculate distance between two points using Haversine formula
const calculateDistance = (point1, point2) => {
  const rad = (x) => (x * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const φ1 = rad(point1.lat);
  const φ2 = rad(point2.lat);
  const Δφ = rad(point2.lat - point1.lat);
  const Δλ = rad(point2.lng - point1.lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

export default function MatchMapView({
  filteredMosques, // Now we'll use this as ALL available mosques, not just filtered
  mapCenter,
  activeFilters,
  allMosques, // New prop for all mosques in the system
}) {
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [currentMosqueForInfoWindow, setCurrentMosqueForInfoWindow] =
    useState(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredMosqueId, setHoveredMosqueId] = useState(null);
  const [mosquesToDisplay, setMosquesToDisplay] = useState([]);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const mapRef = useRef(null);

  // Use filteredMosques as the source if provided, otherwise use allMosques
  const sourceMosques = useMemo(() => {
    return (filteredMosques?.length > 0 ? filteredMosques : allMosques) || [];
  }, [filteredMosques, allMosques]);

  const distanceRadiusMeters = useMemo(() => {
    return (activeFilters?.distance || 10) * 1609.34; // Convert miles to meters
  }, [activeFilters?.distance]);

  // Filter mosques by distance dynamically
  const filterMosquesByDistance = useCallback(() => {
    if (!mapCenter || !sourceMosques.length) return [];

    // Filter mosques by distance and limit to MAX_MOSQUES_TO_DISPLAY
    const inRangeMosques = sourceMosques
      .map(getSafeMosqueData)
      .filter((mosque) => {
        const distance = calculateDistance(mapCenter, mosque.location);
        return distance <= distanceRadiusMeters;
      })
      .slice(0, MAX_MOSQUES_TO_DISPLAY);

    setHasReachedLimit(inRangeMosques.length >= MAX_MOSQUES_TO_DISPLAY);
    return inRangeMosques;
  }, [mapCenter, sourceMosques, distanceRadiusMeters]);

  // Update mosques to display whenever relevant dependencies change
  useEffect(() => {
    const mosques = filterMosquesByDistance();
    setMosquesToDisplay(mosques);
  }, [filterMosquesByDistance]);

  const createMarkerIcon = useCallback((isFemale, isHovered, isSelected) => {
    const baseBgColor = isFemale ? "#9333EA" : "#3B82F6";
    const selectedColor = "#10B981";
    const hoverColor = isFemale ? "#A855F7" : "#60A5FA";

    const currentBgColor = isSelected
      ? selectedColor
      : isHovered
      ? hoverColor
      : baseBgColor;
    const iconSize = isHovered || isSelected ? 60 : 48;
    const anchorPoint = iconSize / 2;

    const svgContent = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 48C24 48 40 32 40 19C40 10.1634 32.8366 3 24 3C15.1634 3 8 10.1634 8 19C8 32 24 48 24 48Z" fill="${currentBgColor}" stroke="${
      isSelected ? "#059669" : isHovered ? "#3B82F6" : "#FFFFFF"
    }" stroke-width="${isHovered || isSelected ? "2.5" : "2"}"/>
        <circle cx="24" cy="19" r="7" fill="white"/>
        ${
          isFemale
            ? `<circle cx="24" cy="19" r="3" fill="${baseBgColor}"/>`
            : ""
        }
      </svg>
    `;

    const icon = {
      url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
      zIndex: isHovered || isSelected ? 1000 : 5,
    };

    if (typeof window !== "undefined" && window.google?.maps) {
      icon.scaledSize = new window.google.maps.Size(iconSize, iconSize);
      icon.anchor = new window.google.maps.Point(anchorPoint, iconSize);
    }

    return icon;
  }, []);

  const fitMapToDistanceCircle = useCallback(() => {
    if (!map || !mapCenter || typeof window === "undefined") return;

    if (window.google?.maps) {
      const circle = new window.google.maps.Circle({
        center: mapCenter,
        radius: distanceRadiusMeters,
      });
      const circleBounds = circle.getBounds();

      if (circleBounds) {
        map.fitBounds(circleBounds, 10);
      } else {
        map.setCenter(mapCenter);
        map.setZoom(12); // Default zoom if no bounds
      }
    }
  }, [map, mapCenter, distanceRadiusMeters]);

  const handleMarkerClick = useCallback(
    (mosque) => {
      setSelectedMosque(mosque);
      setCurrentMosqueForInfoWindow(mosque);
      setInfoWindowOpen(true);
      map?.panTo({
        lat: mosque.location.lat,
        lng: mosque.location.lng,
      });
    },
    [map]
  );

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMosque(null);
    setInfoWindowOpen(false);
    setCurrentMosqueForInfoWindow(null);
  }, []);

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

  // Effect to manage InfoWindow visibility based on selectedMosque state
  useEffect(() => {
    if (selectedMosque && map) {
      setCurrentMosqueForInfoWindow(selectedMosque);
      setInfoWindowOpen(true);
      map.panTo({
        lat: selectedMosque.location.lat,
        lng: selectedMosque.location.lng,
      });
    } else if (!selectedMosque) {
      setInfoWindowOpen(false);
      setCurrentMosqueForInfoWindow(null);
    }
  }, [selectedMosque, map]);

  // Effect to fit map to the distance circle when map or center changes
  useEffect(() => {
    if (isLoaded && map && mapCenter) {
      fitMapToDistanceCircle();
    }
  }, [isLoaded, map, mapCenter, fitMapToDistanceCircle]);

  const renderInfoWindowContent = useCallback(
    (mosque) => (
      <div className="p-2 max-w-xs font-sans">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">
          {mosque.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{mosque.address}</p>
        <div className="flex items-center mt-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(mosque.rating || 0)
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
          <span className="ml-2 text-xs text-gray-500">
            {mosque.rating?.toFixed(1)} ({mosque.reviewCount || 0} reviews)
          </span>
        </div>
        {mosque.hasFemaleArea && (
          <div className="mt-2 mb-2">
            <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
              Female Prayer Area
            </div>
          </div>
        )}
        {mosque.upcomingPrayer?.name !== "N/A" && (
          <div className="mt-2 mb-3">
            <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full inline-block">
              {mosque.upcomingPrayer.name}: {mosque.upcomingPrayer.time}
            </div>
          </div>
        )}
        <button
          onClick={() => alert(`View details for ${mosque.name}`)}
          className="mt-2 text-sm text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-md w-full transition-colors duration-150"
        >
          View Details
        </button>
      </div>
    ),
    []
  );

  const renderLegendItem = useCallback(
    (isFemale) => {
      const icon = createMarkerIcon(isFemale, false, false);
      const svgContent = decodeURIComponent(
        icon.url.replace("data:image/svg+xml;utf-8,", "")
      );

      return (
        <div className="flex items-center gap-2 mb-1">
          <div
            style={{ width: "24px", height: "24px" }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          <span className="text-xs">
            {isFemale ? "Female Prayer Area" : "Regular Mosque"}
          </span>
        </div>
      );
    },
    [createMarkerIcon]
  );

  return (
    <div className="sticky top-20 md:w-2/5 lg:w-5/12 h-[calc(100vh-100px)] shadow-inner">
      <LoadScript
        googleMapsApiKey={GOOGLE_API}
        onError={(error) => console.error("Error loading Google Maps:", error)}
        loadingElement={
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-primary font-semibold">Loading map...</div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={mapCenter || DEFAULT_CENTER}
          options={MAP_OPTIONS}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {isLoaded && mapCenter && (
            <Circle
              center={mapCenter}
              radius={distanceRadiusMeters}
              options={CIRCLE_OPTIONS}
            />
          )}

          {mosquesToDisplay.map((mosque) => {
            const isCurrentlySelected = selectedMosque?.id === mosque.id;
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
                  mosque.hasFemaleArea,
                  isCurrentlyHovered,
                  isCurrentlySelected
                )}
                zIndex={isCurrentlyHovered || isCurrentlySelected ? 1000 : 5}
              />
            );
          })}

          {infoWindowOpen && currentMosqueForInfoWindow && (
            <InfoWindow
              position={{
                lat: currentMosqueForInfoWindow.location.lat,
                lng: currentMosqueForInfoWindow.location.lng,
              }}
              onCloseClick={handleInfoWindowClose}
              options={{
                pixelOffset:
                  typeof window !== "undefined" && window.google?.maps
                    ? new window.google.maps.Size(
                        0,
                        -(hoveredMosqueId === currentMosqueForInfoWindow.id
                          ? 60 // Adjust offset based on larger hovered icon size
                          : 48) // Default icon size
                      )
                    : undefined,
                disableAutoPan: false,
              }}
            >
              {renderInfoWindowContent(currentMosqueForInfoWindow)}
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 pointer-events-auto">
        <div className="text-sm font-medium">
          <span className="text-primary font-bold">
            {mosquesToDisplay.length || 0}
          </span>{" "}
          {mosquesToDisplay.length === 1 ? "mosque" : "mosques"} in range
          {hasReachedLimit && (
            <span className="block text-xs text-amber-600 mt-1">
              Maximum display limit of {MAX_MOSQUES_TO_DISPLAY} mosques reached
            </span>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 pointer-events-auto">
        <div className="text-sm font-medium mb-2">Map Legend</div>
        {renderLegendItem(false)}
        {renderLegendItem(true)}
      </div>
      {mosquesToDisplay.length > 7 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 pointer-events-auto max-w-[200px]">
          <div className="text-xs text-gray-700">
            <strong>Tip:</strong> Hover over mosque icons to enlarge them.
          </div>
        </div>
      )}
    </div>
  );
}

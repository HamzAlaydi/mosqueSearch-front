"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { GOOGLE_API } from "@/shared/constants/backendLink";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 100px)",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function MapView({
  filteredMosques,
  selectedMosque,
  setSelectedMosque,
  mapCenter,
}) {
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [currentMosque, setCurrentMosque] = useState(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef(null);
  const loadingRef = useRef(false);

  // Handle mosque selection
  useEffect(() => {
    if (selectedMosque && map) {
      setCurrentMosque(selectedMosque);
      setInfoWindowOpen(true);

      map.panTo({
        lat: selectedMosque.location.lat,
        lng: selectedMosque.location.lng,
      });
    }
  }, [selectedMosque, map]);

  // Prevent unnecessary reloads
  useEffect(() => {
    // This effect ensures we keep track of whether the script is already loading
    return () => {
      loadingRef.current = false;
    };
  }, []);

  const handleMarkerClick = useCallback(
    (mosque) => {
      setCurrentMosque(mosque);
      setInfoWindowOpen(true);
      setSelectedMosque(mosque);
    },
    [setSelectedMosque]
  );

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowOpen(false);
    setCurrentMosque(null);
    setSelectedMosque(null);
  }, [setSelectedMosque]);

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;
      setMap(map);
      setIsLoaded(true);
      loadingRef.current = false;

      if (filteredMosques.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();

        filteredMosques.forEach((mosque) => {
          bounds.extend({
            lat: mosque.location.lat,
            lng: mosque.location.lng,
          });
        });

        map.fitBounds(bounds);

        if (filteredMosques.length === 1) {
          map.setZoom(15);
        }
      }
    },
    [filteredMosques]
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
    setIsLoaded(false);
  }, []);

  const getSafeMosqueData = (mosque) => ({
    ...mosque,
    location: mosque.location || { lat: 0, lng: 0 },
    rating: mosque.rating || 0,
    reviewCount: mosque.reviewCount || 0,
    upcomingPrayer: mosque.upcomingPrayer || { name: "", time: "" },
  });

  return (
    <div className="sticky top-20 md:w-2/5 lg:w-5/12 h-[calc(100vh-144px)] shadow-inner">
      <LoadScript
        googleMapsApiKey={GOOGLE_API}
        onLoad={() => {
          console.log("Google Maps script loaded");
          loadingRef.current = true;
        }}
        onError={(error) => console.error("Error loading Google Maps:", error)}
        loadingElement={
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-primary font-semibold">Loading map...</div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
          options={options}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {isLoaded &&
            filteredMosques.map((mosque) => {
              const safeMosque = getSafeMosqueData(mosque);
              return (
                <Marker
                  key={safeMosque.id}
                  position={{
                    lat: safeMosque.location.lat,
                    lng: safeMosque.location.lng,
                  }}
                  onClick={() => handleMarkerClick(safeMosque)}
                  icon={{
                    url:
                      selectedMosque?.id === safeMosque.id
                        ? "/map-icons/mosque-active.svg"
                        : "/map-icons/mosque.svg",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              );
            })}

          {isLoaded && infoWindowOpen && currentMosque && (
            <InfoWindow
              position={{
                lat: currentMosque.location.lat,
                lng: currentMosque.location.lng,
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-medium text-base">{currentMosque.name}</h3>
                <p className="text-sm text-gray-600">{currentMosque.address}</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(currentMosque.rating || 0)
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
                    {currentMosque.rating} ({currentMosque.reviewCount || 0})
                  </span>
                </div>
                {currentMosque.upcomingPrayer && (
                  <div className="mt-2">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {currentMosque.upcomingPrayer.name}:{" "}
                      {currentMosque.upcomingPrayer.time}
                    </div>
                  </div>
                )}
                <button className="mt-2 text-sm text-white bg-primary px-3 py-1 rounded-full hover:bg-opacity-90 w-full">
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

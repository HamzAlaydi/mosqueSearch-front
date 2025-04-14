"use client";
import { useState, useEffect, useCallback } from "react";
import { Formik, Form } from "formik";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { Search, MapPin } from "lucide-react";
import * as Yup from "yup";
import '@/app/mosqueSearch/mosqueSearchPage.css'
const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

const circleOptions = {
  strokeColor: "#4f46e5",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#4f46e5",
  fillOpacity: 0.1,
  clickable: false,
};

const SignupStep9 = ({ onSubmit, prevStep, isLoading, formData }) => {
  const [userLocation, setUserLocation] = useState({
    lat: 51.5074,
    lng: -0.1278,
  });
  const [mosques, setMosques] = useState([]);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 });
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [attachedMosques, setAttachedMosques] = useState(
    formData.attachedMosques || []
  );
  const [searchingLocation, setSearchingLocation] = useState(false);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Mock mosque data - in production you'd fetch this from an API
  useEffect(() => {
    // Simulate fetching mosques data
    const mockMosques = [
      {
        id: "mosque1",
        name: "London Central Mosque",
        address: "146 Park Rd, London NW8 7RG",
        rating: 4.7,
        reviewCount: 1203,
        location: { lat: 51.5262, lng: -0.1606 },
        prayers: ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"],
        facilities: ["Parking", "Wudu", "Women's Section"],
        upcomingPrayer: { name: "Maghrib", time: "18:45" },
      },
      {
        id: "mosque2",
        name: "East London Mosque",
        address: "82-92 Whitechapel Rd, London E1 1JQ",
        rating: 4.5,
        reviewCount: 987,
        location: { lat: 51.5173, lng: -0.064 },
        prayers: ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"],
        facilities: ["Parking", "Wudu", "Women's Section", "Library"],
        upcomingPrayer: { name: "Maghrib", time: "18:45" },
      },
      {
        id: "mosque3",
        name: "Finsbury Park Mosque",
        address: "7-11 St Thomas's Rd, London N4 2QH",
        rating: 4.3,
        reviewCount: 542,
        location: { lat: 51.5636, lng: -0.1178 },
        prayers: ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"],
        facilities: ["Wudu", "Women's Section"],
        upcomingPrayer: { name: "Maghrib", time: "18:45" },
      },
    ];
    setMosques(mockMosques);
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          setMapCenter(pos);
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    }
  }, []);

  // Filter mosques based on distance
  const getFilteredMosques = useCallback(
    (distance) => {
      if (!userLocation) return [];

      return mosques.filter((mosque) => {
        const mosqueLocation = mosque.location;
        const distanceInKm = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mosqueLocation.lat,
          mosqueLocation.lng
        );
        const distanceInMiles = distanceInKm * 0.621371;
        return distanceInMiles <= distance;
      });
    },
    [mosques, userLocation]
  );

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Handle map load
  const onLoad = useCallback((map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setIsLoaded(false);
  }, []);

  // Handle marker click
  const handleMarkerClick = (mosque) => {
    setSelectedMosque(mosque);
    setInfoWindowOpen(true);
    setMapCenter(mosque.location);
  };

  // Handle info window close
  const handleInfoWindowClose = () => {
    setInfoWindowOpen(false);
    setSelectedMosque(null);
  };

  // Handle location search
  const handleLocationSearch = async (query) => {
    if (!query.trim()) return;

    setSearchingLocation(true);

    try {
      // In a real app, this would be a call to the Google Maps Geocoding API
      // For demo purposes, mocking some search results
      const mockResults = [
        { description: "London, UK", location: { lat: 51.5074, lng: -0.1278 } },
        {
          description: "Birmingham, UK",
          location: { lat: 52.4862, lng: -1.8904 },
        },
        {
          description: "Manchester, UK",
          location: { lat: 53.4808, lng: -2.2426 },
        },
      ].filter((item) =>
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching for location:", error);
    } finally {
      setSearchingLocation(false);
    }
  };

  // Handle search result selection
  const handleSelectLocation = (result) => {
    setSearchQuery(result.description);
    setUserLocation(result.location);
    setMapCenter(result.location);
    setShowSearchResults(false);
    if (map) {
      map.panTo(result.location);
      map.setZoom(13);
    }
  };

  // Toggle mosque attachment
  const toggleMosqueAttachment = (mosque) => {
    setAttachedMosques((prev) => {
      const isAttached = prev.some((m) => m.id === mosque.id);

      if (isAttached) {
        return prev.filter((m) => m.id !== mosque.id);
      } else {
        return [...prev, mosque];
      }
    });
  };

  // Check if mosque is attached
  const isMosqueAttached = (mosqueId) => {
    return attachedMosques.some((mosque) => mosque.id === mosqueId);
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    distance: Yup.number().required("Distance is required"),
  });

  return (
    <Formik
      initialValues={{
        distance: formData.distance || 6,
        attachedMosques: formData.attachedMosques || [],
      }}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        // Now uses the onSubmit prop
        onSubmit(values, actions);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => {
        // Filter mosques based on distance
        const filteredMosques = getFilteredMosques(values.distance);

        // Calculate circle radius in meters
        const radiusInMeters = values.distance * 1609.34; // miles to meters

        return (
          <Form className="auth-form">
            <div className="form-group">
              <label>Find Mosques Near You</label>
              <p className="text-sm text-gray-600 mb-4">
                Search for mosques in your area and select ones you'd like to be
                attached to.
              </p>

              {/* Search bar */}
              <div className="relative mb-4">
                <div className="flex items-center border border-gray-300 rounded-full shadow-sm mb-2">
                  <MapPin size={16} className="text-primary ml-3" />
                  <input
                    type="text"
                    placeholder="Search location"
                    className="flex-grow px-2 py-2 focus:outline-none text-sm rounded-full"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleLocationSearch(e.target.value);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                  />
                  <button
                    type="button"
                    className="bg-primary p-2 rounded-full text-white mr-1"
                    onClick={() => handleLocationSearch(searchQuery)}
                  >
                    <Search size={16} />
                  </button>
                </div>

                {/* Search results dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectLocation(result)}
                      >
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm">{result.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Distance slider */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-1 block">
                  Search Distance: {values.distance} miles
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={values.distance}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setFieldValue("distance", newValue);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Map */}
              <div className="mb-4">
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={12}
                    options={options}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                  >
                    {/* User location marker */}
                    <Marker
                      position={userLocation}
                      icon={{
                        url: "/map-icons/user-location.svg",
                        scaledSize: isLoaded
                          ? new window.google.maps.Size(30, 30)
                          : null,
                      }}
                    />

                    {/* Distance radius circle */}
                    <Circle
                      center={userLocation}
                      radius={radiusInMeters}
                      options={circleOptions}
                    />

                    {/* Mosque markers */}
                    {isLoaded &&
                      filteredMosques.map((mosque) => (
                        <Marker
                          key={mosque.id}
                          position={mosque.location}
                          onClick={() => handleMarkerClick(mosque)}
                          icon={{
                            url: isMosqueAttached(mosque.id)
                              ? "/map-icons/mosque-active.svg"
                              : "/map-icons/mosque.svg",
                            scaledSize: new window.google.maps.Size(40, 40),
                          }}
                        />
                      ))}

                    {/* Info window for selected mosque */}
                    {isLoaded && infoWindowOpen && selectedMosque && (
                      <InfoWindow
                        position={selectedMosque.location}
                        onCloseClick={handleInfoWindowClose}
                      >
                        <div className="p-2 max-w-xs">
                          <h3 className="font-medium text-base">
                            {selectedMosque.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedMosque.address}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(selectedMosque.rating || 0)
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
                              {selectedMosque.reviewCount || 0})
                            </span>
                          </div>

                          {selectedMosque.upcomingPrayer && (
                            <div className="mt-2">
                              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                {selectedMosque.upcomingPrayer.name}:{" "}
                                {selectedMosque.upcomingPrayer.time}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              toggleMosqueAttachment(selectedMosque)
                            }
                            className={`mt-2 text-sm text-white px-3 py-1 rounded-full w-full ${
                              isMosqueAttached(selectedMosque.id)
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-primary hover:bg-opacity-90"
                            }`}
                          >
                            {isMosqueAttached(selectedMosque.id)
                              ? "Remove Attachment"
                              : "Attach to Mosque"}
                          </button>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>

              {/* Selected mosques list */}
              {attachedMosques.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">
                    Selected Mosques ({attachedMosques.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {attachedMosques.map((mosque) => (
                      <div
                        key={mosque.id}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{mosque.name}</p>
                          <p className="text-sm text-gray-600">
                            {mosque.address}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMosqueAttachment(mosque)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-navigation">
              <button
                type="button"
                onClick={() =>
                  prevStep({
                    distance: values.distance,
                    attachedMosques,
                  })
                }
                className="auth-button secondary"
              >
                Previous
              </button>
              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading
                  ? "Creating Account..."
                  : "Complete Registration"}{" "}
                {/* Final submit button */}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default SignupStep9;

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Menu,
  User,
  Sliders,
  Heart,
  MessageCircle,
  Info,
  Bell,
  Loader2,
  X,
} from "lucide-react";
import InterestsModal from "./InterestsModal";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/auth/authSlice";
import { useRouter } from "next/navigation";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { initializeSocket } from "@/shared/services/socketService";
import {
  fetchNotifications,
  markAsRead,
} from "@/redux/notification/notificationSlice";
import { HeaderNotifications } from "../NotificationSystem";
import { useMediaQuery } from "react-responsive";

// Detach Confirmation Modal Component
const DetachConfirmationModal = ({ isOpen, onClose, mosque, onConfirm }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detach from Mosque
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X size={24} className="text-red-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Are you sure?
              </h4>
              <p className="text-sm text-gray-600">
                You're about to detach from this mosque
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <div>
                <h5 className="font-medium text-gray-900">{mosque?.name}</h5>
                {mosque?.address && (
                  <p className="text-sm text-gray-600 mt-1">{mosque.address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-800 text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  Important Note
                </p>
                <p className="text-sm text-yellow-700">
                  This action will remove this mosque from your attached mosques
                  list. You can always re-attach to it later from the map.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-red rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Detach from Mosque
          </button>
        </div>
      </div>
    </div>
  );
};

// Attached Mosques Popup Component
const AttachedMosquesPopup = ({
  isOpen,
  onClose,
  attachedMosques,
  onDetachMosque,
  detachingMosque,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Attached Mosques
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {attachedMosques && attachedMosques.length > 0 ? (
            <div className="space-y-3">
              {attachedMosques.map((mosque, index) => (
                <div
                  key={mosque.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {mosque.name}
                      </h4>
                      {mosque.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {mosque.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-600" />
                    <button
                      onClick={() => onDetachMosque(mosque)}
                      disabled={detachingMosque === mosque.id}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        detachingMosque === mosque.id
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 hover:scale-105"
                      }`}
                      title="Detach from this mosque"
                    >
                      {detachingMosque === mosque.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Attached Mosques
              </h4>
              <p className="text-gray-600 text-sm">
                You haven't attached to any mosques yet. Use the map to find and
                attach to mosques in your area.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Distance Range Slider Component
const DistanceFilter = ({ value, onChange }) => {
  const [distance, setDistance] = useState(value || 6); // Default to 6 miles

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setDistance(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${rootRoute}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${rootRoute}/notifications/unread-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    if (currentUser) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [currentUser]);
  return (
    <div className="relative flex flex-col min-w-[120px]">
      <label className="text-xs text-gray-500 mb-1">
        Distance: {distance} miles
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={distance}
        onChange={handleChange}
        className="h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default function Header({
  onSearchSubmit,
  toggleFilter,
  toggleMap,
  activeFilters,
  handleFilterChange,
  showMap,
  setMapCenter,
  userLocation,
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [showDistanceInfo, setShowDistanceInfo] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [servicesReady, setServicesReady] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [showAttachedMosquesPopup, setShowAttachedMosquesPopup] =
    useState(false);
  const [showDetachConfirmation, setShowDetachConfirmation] = useState(false);
  const [mosqueToDetach, setMosqueToDetach] = useState(null);
  const [detachingMosque, setDetachingMosque] = useState(null);
  const autocompleteService = useRef(null);
  const geocoder = useRef(null);
  const searchDebounceTimer = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const userMenuRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const distanceInfoRef = useRef(null);

  // Get current user from Redux
  const { currentUser } = useSelector((state) => state.user);

  // Initialize Google services when script loads
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
          geocoder.current = new window.google.maps.Geocoder();
          setServicesReady(true);
          setServicesLoading(false);
          console.log("Google Maps services loaded successfully");
        } catch (error) {
          console.error("Error initializing Google Maps services:", error);
          setServicesLoading(false);
        }
      }
    };

    // Check if Google Maps is available every second for a maximum of 10 seconds
    const interval = setInterval(() => {
      checkGoogleMaps();
    }, 1000);

    // Stop checking after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setServicesLoading(false);
      console.log("Google Maps services failed to load, using fallback");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (currentUser?._id) {
      initializeSocket();
    }
    // No need to clean up as disconnectSocket will be called on logout
  }, [currentUser?._id]);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    // Only add event listener when menu is open
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Handle click outside to close location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setLocationDropdownOpen(false);
        setSearchResults([]);
      }
    };

    if (locationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [locationDropdownOpen]);

  // Handle click outside to close distance info tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        distanceInfoRef.current &&
        !distanceInfoRef.current.contains(event.target)
      ) {
        setShowDistanceInfo(false);
      }
    };

    if (showDistanceInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDistanceInfo]);

  // Simulate notification data - in a real app, these would come from the backend
  useEffect(() => {
    if (!currentUser?._id) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${rootRoute}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${rootRoute}/notifications/unread-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    if (currentUser) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [currentUser]);

  // Update search query when userLocation changes
  useEffect(() => {
    if (userLocation?.address) {
      setSearchQuery(userLocation.address);
    }
  }, [userLocation]);

  // Fallback search using LocationIQ API
  const searchWithLocationIQ = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingLocation(true);

    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=pk.288b6dab564970e7a979efef12013f91&q=${encodeURIComponent(
          query
        )}&limit=10`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const formattedResults = data.map((item) => ({
        description: item.display_name,
        placeId: item.place_id,
        mainText: item.display_name.split(",")[0] || item.display_name,
        secondaryText:
          item.display_name.split(",").slice(1).join(",").trim() || "",
        types: item.type ? [item.type] : [],
        location: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      }));

      setSearchResults(formattedResults);
      setLocationDropdownOpen(true);
    } catch (err) {
      console.error("LocationIQ search error:", err);
      setSearchResults([]);
    } finally {
      setSearchingLocation(false);
    }
  }, []);

  const handleLocationSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // If Google Maps services are available, use them
      if (autocompleteService.current) {
        setSearchingLocation(true);

        try {
          const request = {
            input: query,
            types: ["geocode", "establishment"],
            language: "en",
          };

          // Add location bias if we have user location (optional, not required)
          if (userLocation) {
            request.location = new window.google.maps.LatLng(
              userLocation.lat,
              userLocation.lng
            );
            request.radius = 50000; // 50km radius
          }

          const predictions = await new Promise((resolve, reject) => {
            autocompleteService.current.getPlacePredictions(
              request,
              (predictions, status) => {
                if (
                  status !== window.google.maps.places.PlacesServiceStatus.OK
                ) {
                  reject(status);
                } else {
                  resolve(predictions || []);
                }
              }
            );
          });

          // Format and deduplicate results
          const formattedResults = predictions.map((p) => ({
            description: p.description,
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text || "",
            secondaryText: p.structured_formatting?.secondary_text || "",
            types: p.types || [],
          }));

          setSearchResults(formattedResults);
          setLocationDropdownOpen(true);
        } catch (err) {
          console.error("Google Maps search error:", err);
          // Fallback to LocationIQ if Google Maps fails
          await searchWithLocationIQ(query);
        } finally {
          setSearchingLocation(false);
        }
      } else {
        // Use LocationIQ as fallback
        await searchWithLocationIQ(query);
      }
    },
    [userLocation, searchWithLocationIQ]
  );

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    (query) => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }

      searchDebounceTimer.current = setTimeout(() => {
        handleLocationSearch(query);
      }, 300);
    },
    [handleLocationSearch]
  );

  const handleSelectLocation = useCallback(
    async (result) => {
      setSearchingLocation(true);

      try {
        // If we have coordinates directly from LocationIQ
        if (result.location) {
          setSearchQuery(result.description);
          setLocationDropdownOpen(false);
          setSearchResults([]);

          if (setMapCenter) {
            setMapCenter({
              lat: result.location.lat,
              lng: result.location.lng,
            });
          }
          return;
        }

        // Otherwise try to geocode with Google Maps
        if (geocoder.current) {
          const geocodeResults = await new Promise((resolve, reject) => {
            geocoder.current.geocode(
              { placeId: result.placeId },
              (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK) {
                  resolve(results);
                } else {
                  reject(status);
                }
              }
            );
          });

          if (geocodeResults && geocodeResults[0]) {
            const location = geocodeResults[0].geometry.location;

            setSearchQuery(result.description);
            setLocationDropdownOpen(false);
            setSearchResults([]);

            if (setMapCenter) {
              setMapCenter({
                lat: location.lat(),
                lng: location.lng(),
              });
            }
          }
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setSearchingLocation(false);
      }
    },
    [setMapCenter]
  );

  const handleOpenInterests = () => {
    setIsInterestsModalOpen(true);
  };

  const handleCloseInterests = () => {
    setIsInterestsModalOpen(false);
  };

  const handleOpenAttachedMosques = () => {
    setShowAttachedMosquesPopup(true);
  };

  const handleCloseAttachedMosques = () => {
    setShowAttachedMosquesPopup(false);
    // Also close confirmation modal if open
    setShowDetachConfirmation(false);
    setMosqueToDetach(null);
  };

  const handleDetachMosque = (mosque) => {
    if (!currentUser) {
      toast.error("Please log in to manage mosque attachments");
      return;
    }

    // Show custom confirmation modal
    setMosqueToDetach(mosque);
    setShowDetachConfirmation(true);
  };

  const handleConfirmDetach = async () => {
    if (!mosqueToDetach) return;

    setDetachingMosque(mosqueToDetach.id);
    setShowDetachConfirmation(false);
    setMosqueToDetach(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const mosqueIdentifier =
        mosqueToDetach.externalId || mosqueToDetach.id || mosqueToDetach._id;

      const response = await axios.post(
        `${rootRoute}/mosque-attachments/request`,
        {
          mosqueId: mosqueIdentifier,
          mosqueData: {
            name: mosqueToDetach.name,
            address: mosqueToDetach.address,
            location: mosqueToDetach.location,
            externalId: mosqueToDetach.id || mosqueToDetach.externalId,
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
        toast.success(`Successfully detached from ${mosqueToDetach.name}!`);
        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(
          response.data.message || "Failed to detach from mosque"
        );
      }
    } catch (error) {
      console.error("Failed to detach from mosque:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to detach from mosque. Please try again."
      );
    } finally {
      setDetachingMosque(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
  };

  const handleDistanceChange = (value) => {
    handleFilterChange("distance", value);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/auth/login");
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    dispatch(markAsRead(notification._id));

    // Handle different notification types
    switch (notification.type) {
      case "message":
        router.push("/messages");
        break;
      case "match":
        router.push("/mosqueSearch");
        break;
      case "profile":
        router.push("/profile");
        break;
      default:
        break;
    }
  };

  const markAllAsRead = () => {
    // Implement mark all as read functionality
    console.log("Mark all as read");
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 767;

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-primary text-xl font-bold">MosqueFind</span>
        </Link>

        {/* Search Bar and Controls Group */}
        <div className="hidden md:flex items-center gap-3 flex-grow max-w-4xl mx-4">
          {/* Compact Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition duration-200 group max-w-xs w-full"
          >
            <div
              className="flex-grow pl-4 pr-2 relative"
              ref={locationDropdownRef}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <input
                  type="text"
                  placeholder={
                    servicesReady
                      ? "Search for any location, city, zip code, or address"
                      : "Loading map services... You can type to search once ready"
                  }
                  className="w-full text-sm py-2 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    if (value.length > 2) {
                      debouncedSearch(value);
                    } else {
                      setSearchResults([]);
                      setLocationDropdownOpen(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setLocationDropdownOpen(true);
                  }}
                />
                {searchingLocation && (
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                )}
              </div>

              {/* Location Dropdown */}
              {locationDropdownOpen && searchResults.length > 0 && (
                <div
                  ref={resultsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => handleSelectLocation(result)}
                    >
                      <MapPin
                        size={14}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="font-medium text-sm truncate">
                          {result.mainText}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {result.secondaryText}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-primary p-2 rounded-full text-white mr-1 group-hover:scale-105 transition-transform"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Distance Range Filter */}
          <div
            className="border border-gray-300 rounded-full px-3 py-2 flex items-center shadow-sm relative"
            ref={distanceInfoRef}
          >
            <DistanceFilter
              value={activeFilters?.distance || 10}
              onChange={handleDistanceChange}
            />
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowDistanceInfo(!showDistanceInfo);
              }}
            >
              <Info size={14} />
            </button>

            {/* Distance Info Tooltip */}
            {showDistanceInfo && (
              <div
                className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-48"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs text-gray-600">
                  Adjust the distance to see mosques within your preferred
                  radius. The map will show a circle representing this area.
                </p>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Map Toggle Button */}
            <button
              onClick={toggleMap}
              className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 hover:shadow-sm text-sm"
            >
              {showMap ? "Hide map" : "Show map"}
            </button>

            {/* Filter Button */}
            {/* <button
              onClick={toggleFilter}
              className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 hover:shadow-sm text-sm"
            >
              <Sliders size={14} className="text-gray-600" />
              <span>Filters</span>
            </button> */}

            {/* Messages Button */}
            <Link href="/messages">
              <button className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 hover:shadow-sm text-sm">
                <MessageCircle size={14} className="text-gray-600" />
                <span>Messages</span>
              </button>
            </Link>

            {/* Interests Button */}
            <button
              onClick={handleOpenInterests}
              className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 hover:shadow-sm text-sm"
            >
              <Heart size={14} className="text-gray-600" />
              <span>Interests</span>
            </button>

            {/* Modal */}
            <InterestsModal
              isOpen={isInterestsModalOpen}
              onClose={handleCloseInterests}
            />
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <HeaderNotifications />

          {/* InterestsModal for use with notifications */}
          <InterestsModal
            isOpen={isInterestsModalOpen}
            onClose={handleCloseInterests}
          />
          <button
            onClick={handleOpenAttachedMosques}
            className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full transition flex items-center gap-2"
          >
            <span>
              Attached Mosques ({currentUser?.attachedMosques?.length || 0})
            </span>
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition"
              onClick={toggleUserMenu}
            >
              <Menu size={18} className="text-gray-600" />
              <div className="bg-gray-200 rounded-full p-1">
                <User size={18} className="text-gray-600" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  {/* <div className="px-3 py-2 text-sm font-medium border-b border-gray-100">
                    {currentUser?.name || "User"}
                  </div> */}
                  <Link href="/profile">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                      Profile
                    </button>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attached Mosques Popup */}
      <AttachedMosquesPopup
        isOpen={showAttachedMosquesPopup}
        onClose={handleCloseAttachedMosques}
        attachedMosques={currentUser?.attachedMosques || []}
        onDetachMosque={handleDetachMosque}
        detachingMosque={detachingMosque}
      />

      {/* Detach Confirmation Modal */}
      <DetachConfirmationModal
        isOpen={showDetachConfirmation}
        onClose={() => {
          setShowDetachConfirmation(false);
          setMosqueToDetach(null);
        }}
        mosque={mosqueToDetach}
        onConfirm={handleConfirmDetach}
      />
    </header>
  );
}

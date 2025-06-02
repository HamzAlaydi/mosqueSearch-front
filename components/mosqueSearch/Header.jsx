"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import InterestsModal from "./InterestsModal";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/auth/authSlice";
import { useRouter } from "next/navigation";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";
import { io } from "socket.io-client";
import { initializeSocket } from "@/shared/services/socketService";
import {
  fetchNotifications,
  markAsRead,
} from "@/redux/notification/notificationSlice";
import { HeaderNotifications } from "../NotificationSystem";
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

  // Get current user from Redux
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    if (currentUser?._id) {
      initializeSocket();
    }
    // No need to clean up as disconnectSocket will be called on logout
  }, [currentUser?._id]);
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

        // Count unread notifications
        const unread = response.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    // Set up socket connection for real-time notifications
    const socket = io(rootRoute);
    socket.emit("joinRoom", currentUser._id);

    socket.on("newNotification", (notification) => {
      // Add the new notification to the list
      setNotifications((prev) => [notification, ...prev]);
      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // You could add a toast notification here
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenInterests = () => {
    setIsInterestsModalOpen(true);
  };

  const handleCloseInterests = () => {
    setIsInterestsModalOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleDistanceChange = (value) => {
    if (handleFilterChange) {
      handleFilterChange("distance", value);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/auth/login"); // redirect to login or home after logout
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Handle different notification types
    if (notification.type === "interest") {
      setShowNotificationsMenu(false);
      handleOpenInterests();
    } else if (notification.type === "unblur_request") {
      setShowNotificationsMenu(false);
      router.push(`/profile/${notification.from.id}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Format the timestamp for display
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    if (secondsAgo < 60) return "just now";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  // Update search query when user location changes
  useEffect(() => {
    if (userLocation?.address) {
      setSearchQuery(userLocation.address);
    }
  }, [userLocation]);

  const popularLocations = [
    "London, UK",
    "Birmingham, UK",
    "Manchester, UK",
    "Glasgow, UK",
    "Leeds, UK",
  ];

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSearchQuery(location);
    setLocationDropdownOpen(false);

    // You would typically integrate with a geocoding service here
    // For now, we'll simulate with mock coordinates
    const mockCoordinates = {
      "London, UK": { lat: 51.5074, lng: -0.1278 },
      "Birmingham, UK": { lat: 52.4862, lng: -1.8904 },
      "Manchester, UK": { lat: 53.4808, lng: -2.2426 },
      "Glasgow, UK": { lat: 55.8642, lng: -4.2518 },
      "Leeds, UK": { lat: 53.8008, lng: -1.5491 },
    };

    if (mockCoordinates[location] && setMapCenter) {
      setMapCenter(mockCoordinates[location]);
    }
  };

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
            <div className="flex-grow pl-4 pr-2 relative">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search location"
                  className="w-full text-sm py-2 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setLocationDropdownOpen(true)}
                  onBlur={() =>
                    setTimeout(() => setLocationDropdownOpen(false), 200)
                  }
                />
              </div>

              {/* Location Dropdown */}
              {locationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-2 py-1">
                      Popular locations
                    </p>
                    {popularLocations.map((location) => (
                      <div
                        key={location}
                        className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-2"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm">{location}</span>
                      </div>
                    ))}
                  </div>
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
          <div className="border border-gray-300 rounded-full px-3 py-2 flex items-center shadow-sm relative">
            <DistanceFilter
              value={activeFilters?.distance || 10}
              onChange={handleDistanceChange}
            />
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDistanceInfo(!showDistanceInfo)}
            >
              <Info size={14} />
            </button>

            {/* Distance Info Tooltip */}
            {showDistanceInfo && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-48">
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
            <button
              onClick={toggleFilter}
              className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 hover:shadow-sm text-sm"
            >
              <Sliders size={14} className="text-gray-600" />
              <span>Filters</span>
            </button>

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
          <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full transition">
            Switch to Quran App
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Menu size={18} className="text-gray-600" />
              <div className="bg-gray-200 rounded-full p-1">
                <User size={18} className="text-gray-600" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                <div className="py-2">
                  <a
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar and Controls - Only visible on small screens */}
      <div className="md:hidden px-4 py-2">
        <div className="flex flex-col gap-2">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center border border-gray-300 rounded-full p-2 shadow-sm"
          >
            <Search size={12} className="text-primary ml-2" />
            <input
              type="text"
              placeholder="Search for mosques in London..."
              className="flex-grow px-2 py-1 focus:outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleFilter}
              className="bg-gray-100 p-2 rounded-full mr-1"
            >
              <Sliders size={16} className="text-gray-600" />
            </button>
            <button
              type="submit"
              className="bg-primary text-white p-2 rounded-full"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Mobile Control Buttons */}
          <div className="flex justify-between gap-2">
            <div className="flex-1">
              <DistanceFilter
                value={activeFilters?.distance || 10}
                onChange={handleDistanceChange}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleMap}
                className="p-2 bg-gray-100 rounded-full"
              >
                {showMap ? "Hide map" : "Show map"}
              </button>

              <button className="p-2 bg-gray-100 rounded-full">
                <MessageCircle size={16} className="text-gray-600" />
              </button>

              <button className="p-2 bg-gray-100 rounded-full">
                <Heart size={16} className="text-gray-600" />
              </button>

              {/* Mobile notification bell */}
              <button className="p-2 bg-gray-100 rounded-full relative">
                <Bell size={16} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

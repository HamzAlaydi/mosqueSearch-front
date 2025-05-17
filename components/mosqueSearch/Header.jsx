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
} from "lucide-react";
import InterestsModal from "./InterestsModal";

// Distance Range Slider Component
const DistanceFilter = ({ value, onChange }) => {
  const [distance, setDistance] = useState(value || 6); // Default to 6 miles

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setDistance(newValue);
    onChange(newValue);
  };

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [showDistanceInfo, setShowDistanceInfo] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);

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
    <header className="class='border-b border-gray-200 bg-white sticky top-0 z-30">
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
            <button className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 hover:shadow-sm text-sm">
              <MessageCircle size={14} className="text-gray-600" />
              <span>Messages</span>
            </button>

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
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Sign up
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Log in
                  </a>
                  <div className="border-t border-gray-200 my-1"></div>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Mosque dashboard
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Community events
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Settings
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Help
                  </a>
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

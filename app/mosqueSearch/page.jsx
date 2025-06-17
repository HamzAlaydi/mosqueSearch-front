// src/app/match-search/page.jsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/mosqueSearch/Header";
import FilterModal from "../../components/mosqueSearch/FilterModal";
import ActiveFilters from "../../components/mosqueSearch/ActiveFilters";
import MatchListings from "../../components/mosqueSearch/MatchListings";
import MatchMapView from "../../components/mosqueSearch/MatchMapView";
import { allMosquesInLondon } from "../../shared/allMosquesInLondon";
import {
  fetchMatches,
  setSearchDistance,
  updateFilters,
  removeFilter as removeFilterAction,
  clearAllFilters as clearAllFiltersAction,
  fetchMatchesByMosque,
  clearMatches,
  switchToMosqueMode,
  switchToProfessionalMode,
} from "../../redux/match/matchSlice";
import "./mosqueSearchPage.css";

// Helper function to ensure mosque data is safe to use
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

// Distance calculation function (Haversine formula)
const isWithinDistance = (mosque, center, radiusMeters) => {
  // Ensure valid inputs before calculating
  if (
    !center ||
    typeof center.lat !== "number" ||
    typeof center.lng !== "number" ||
    !mosque.location ||
    typeof mosque.location.lat !== "number" ||
    typeof mosque.location.lng !== "number"
  ) {
    return false;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const lat1 = toRad(center.lat);
  const lon1 = toRad(center.lng);
  const lat2 = toRad(mosque.location.lat);
  const lon2 = toRad(mosque.location.lng);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
};

/**
 * Main page component for mosque search, filtering, listing, and map view.
 * Manages state for filters, map center, view modes, and coordinates data flow.
 */
export default function MatchSearchPage() {
  const dispatch = useDispatch();
  const {
    matches = [],
    professionalMatches = [],
    mosqueMatches = [],
    searchedMosques = [],
    activeFilters = {
      prayer: [],
      facilities: [],
      rating: null,
      distance: 20,
      religiousness: [],
      maritalStatus: [],
      ageRange: { min: 18, max: 65 },
      hasChildren: [],
      childrenDesire: [],
      educationLevel: [],
      profession: [],
      willingToRelocate: null,
    },
    loading = false,
  } = useSelector((state) => state.matches || {});

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 }); // Default to London
  const [showMap, setShowMap] = useState(true);
  const [listingsView, setListingsView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");

  const [searchMode, setSearchMode] = useState("professional"); // 'professional' or 'mosque'
  const [selectedMosqueForSearch, setSelectedMosqueForSearch] = useState(null);
  // Sync internal activeFilters.distance state with Redux searchDistance
  useEffect(() => {
    dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }));
  }, [dispatch, activeFilters, mapCenter]);

  // Calculate distance radius in meters based on activeFilters.distance
  const distanceRadiusMeters = useMemo(() => {
    const distanceMiles =
      typeof activeFilters.distance === "number" ? activeFilters.distance : 10;
    return distanceMiles * 1609.34; // Convert miles to meters
  }, [activeFilters.distance]);

  // Memoize the list of mosques within the current distance range from mapCenter
  const mosquesWithinDistance = useMemo(() => {
    console.log("Recalculating mosquesWithinDistance memo...");

    if (
      !mapCenter ||
      typeof mapCenter.lat !== "number" ||
      typeof mapCenter.lng !== "number" ||
      !Array.isArray(allMosquesInLondon)
    ) {
      return [];
    }

    return allMosquesInLondon
      .map(getSafeMosqueData)
      .filter((mosque) =>
        isWithinDistance(mosque, mapCenter, distanceRadiusMeters)
      );
  }, [allMosquesInLondon, mapCenter, distanceRadiusMeters]);

  // Memoize the list of mosques after applying ALL filters
  const fullyFilteredMosques = useMemo(() => {
    console.log("Recalculating fullyFilteredMosques memo...");

    return mosquesWithinDistance.filter((mosque) => {
      // Filter by category
      if (
        activeCategory !== "all" &&
        (!mosque.categories || !mosque.categories.includes(activeCategory))
      ) {
        return false;
      }

      // Filter by prayer types
      if ((activeFilters.prayer?.length || 0) > 0) {
        const hasAllPrayers = activeFilters.prayer.every((prayer) =>
          mosque.prayers?.includes(prayer)
        );
        if (!hasAllPrayers) return false;
      }

      // Filter by facilities
      if ((activeFilters.facilities?.length || 0) > 0) {
        const hasAllFacilities = activeFilters.facilities.every((facility) =>
          mosque.facilities?.includes(facility)
        );
        if (!hasAllFacilities) return false;
      }

      // Filter by rating
      if (
        activeFilters.rating !== null &&
        (mosque.rating || 0) < activeFilters.rating
      ) {
        return false;
      }

      return true; // Include if all filters pass
    });
  }, [
    mosquesWithinDistance,
    activeCategory,
    activeFilters.prayer,
    activeFilters.facilities,
    activeFilters.rating,
  ]);

  // Effect to dispatch fetchMatches when distance or mapCenter changes
  useEffect(() => {
    if (searchMode === "professional") {
      console.log("Dispatching fetchMatches for professional mode...");
      dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }));
    }
  }, [dispatch, activeFilters, mapCenter, searchMode]);

  // --- UI Toggle Functions ---
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  // --- Filter Change Handlers ---
  const handleFilterChange = (category, value) => {
    dispatch(updateFilters({ category, value }));
  };

  const handleMatchClick = (match) => {
    if (match.location && typeof match.location === "object") {
      // Check for standard lat/lng object { lat: number, lng: number }
      if (
        typeof match.location.lat === "number" &&
        typeof match.location.lng === "number"
      ) {
        setMapCenter(match.location);
      }
      // Check for GeoJSON coordinates array [lng, lat]
      else if (
        match.location.coordinates &&
        Array.isArray(match.location.coordinates) &&
        match.location.coordinates.length === 2 &&
        typeof match.location.coordinates[0] === "number" && // lng
        typeof match.location.coordinates[1] === "number" // lat
      ) {
        setMapCenter({
          lat: match.location.coordinates[1], // GeoJSON is [lng, lat]
          lng: match.location.coordinates[0],
        });
      } else {
        console.warn("Clicked item has invalid location data:", match.location);
      }
    } else {
      console.warn("Clicked item has no location data:", match);
    }
  };

  const removeFilter = (category, value) => {
    dispatch(removeFilterAction({ category, value }));
  };

  const clearAllFilters = () => {
    dispatch(clearAllFiltersAction());
  };

  // Handler for clicking on a mosque item
  const handleMosqueClick = (item) => {
    console.log("Mosque clicked:", item);

    if (item.location && typeof item.location === "object") {
      // Check for standard lat/lng object { lat: number, lng: number }
      if (
        typeof item.location.lat === "number" &&
        typeof item.location.lng === "number"
      ) {
        setMapCenter(item.location);
      }
      // Check for GeoJSON coordinates array [lng, lat]
      else if (
        item.location.coordinates &&
        Array.isArray(item.location.coordinates) &&
        item.location.coordinates.length === 2 &&
        typeof item.location.coordinates[0] === "number" && // lng
        typeof item.location.coordinates[1] === "number" // lat
      ) {
        setMapCenter({
          lat: item.location.coordinates[1], // GeoJSON is [lng, lat]
          lng: item.location.coordinates[0],
        });
      } else {
        console.warn("Clicked item has invalid location data:", item.location);
      }
    } else {
      console.warn("Clicked item has no location data:", item);
    }
  };

  // --- View Toggle Functions ---
  const toggleMap = () => setShowMap(!showMap);
  const toggleListingsView = () =>
    setListingsView(listingsView === "grid" ? "list" : "grid");

  // --- Search Input Handler ---
  const handleSearchSubmit = (query) => {
    console.log("Search submitted:", query);
    // Implementation for geocoding would go here
  };

  // Add this function to handle mosque-based search:
  const handleSearchInMosque = useCallback(
    (mosque) => {
      const mosqueId = mosque.id || mosque._id;

      // Check if this mosque has already been searched
      if (searchedMosques.includes(mosqueId)) {
        console.log(`Mosque ${mosque.name} already searched, skipping...`);
        return;
      }

      setSelectedMosqueForSearch(mosque);

      // Dispatch action to fetch females attached to this mosque
      dispatch(
        fetchMatchesByMosque({
          mosqueId: mosqueId,
          mosqueName: mosque.name,
        })
      );
    },
    [dispatch, searchedMosques]
  );

  const handleSearchModeToggle = useCallback(() => {
    const newMode = searchMode === "professional" ? "mosque" : "professional";
    setSearchMode(newMode);

    if (newMode === "professional") {
      // Switching to Professional mode
      dispatch(switchToProfessionalMode());
      setSelectedMosqueForSearch(null);

      // Only fetch if we don't have professional matches
      if (professionalMatches.length === 0) {
        dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }));
      }
    } else {
      // Switching to Mosque mode
      dispatch(switchToMosqueMode());
      setSelectedMosqueForSearch(null);
    }
  }, [
    searchMode,
    dispatch,
    activeFilters,
    mapCenter,
    professionalMatches.length,
  ]);
  return (
    <div className="bg-white min-h-screen">
      {/* Main Navigation Header */}
      <Header
        onSearchSubmit={handleSearchSubmit}
        toggleFilter={toggleFilter}
        toggleMap={toggleMap}
        activeFilters={activeFilters}
        handleFilterChange={handleFilterChange}
        showMap={showMap}
        setMapCenter={setMapCenter}
      />

      {/* Filter Modal */}
      {isFilterOpen && (
        <FilterModal
          toggleFilter={toggleFilter}
          activeFilters={activeFilters}
          handleFilterChange={handleFilterChange}
          filteredMatches={matches}
        />
      )}
      {/* Main Content Area */}
      <div className="pt-32 md:pt-36 flex flex-col md:flex-row">
        {/* Match Listings Section */}
        <div
          className={`${
            showMap ? "w-full md:w-3/5 lg:w-7/12" : "w-full"
          } transition-all duration-300`}
        >
          {/* Sticky header/filter summary */}
          <div className="px-4 py-2 sticky top-12 bg-white z-20 border-b border-gray-200">
            {/* Top row: Title and View Toggles */}
            <div className="flex justify-between items-center mb-2">
              {/* Toggle: Professional / Mosque */}

              <div>
                <h1 className="text-lg font-semibold">Potential Matches</h1>
                <p className="text-sm text-gray-600">
                  Within {activeFilters.distance} miles
                </p>
              </div>

              {/* View toggle buttons */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={toggleListingsView}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Toggle list/grid view"
                >
                  {listingsView === "grid" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                {/* Professional Label */}
                <span
                  className={`text-sm transition-colors duration-200 ${
                    searchMode === "professional"
                      ? "text-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Professional
                </span>

                {/* Switch Button */}
                <button
                  onClick={handleSearchModeToggle}
                  className={`relative inline-flex h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    searchMode === "mosque" ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      searchMode === "mosque"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>

                {/* Mosque Label */}
                <span
                  className={`text-sm transition-colors duration-200 ${
                    searchMode === "mosque"
                      ? "text-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Mosque
                </span>
              </div>
            </div>

            {/* Active Filters Display */}
            <ActiveFilters
              activeFilters={activeFilters}
              removeFilter={removeFilter}
              clearAllFilters={clearAllFilters}
            />
          </div>

          {/* Mosque Listings Cards */}
          <MatchListings
            listingsView={listingsView}
            handleMatchClick={handleMatchClick}
            matchesToShow={matches}
            loading={loading}
          />
        </div>

        {/* Map Section */}
        {showMap && (
          <MatchMapView
            filteredMosques={mosquesWithinDistance}
            mapCenter={mapCenter}
            allMosques={allMosquesInLondon}
            activeFilters={activeFilters}
            onSearchInMosque={handleSearchInMosque}
            searchMode={searchMode}
          />
        )}
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-20">
        <button
          onClick={toggleFilter}
          className="bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          aria-label="Open filter modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filters (
          {
            Object.values(activeFilters)
              .flat()
              .filter((f) => f !== null && f !== 20).length
          }
          )
        </button>
      </div>
    </div>
  );
}

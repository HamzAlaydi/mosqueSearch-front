// src/app/match-search/page.jsx (or .js)

"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/mosqueSearch/Header";
import CategoryNav from "../../components/mosqueSearch/CategoryNav";
import FilterModal from "../../components/mosqueSearch/FilterModal";
import ActiveFilters from "../../components/mosqueSearch/ActiveFilters";
import MatchListings from "../../components/mosqueSearch/MatchListings";
import MatchMapView from "../../components/mosqueSearch/MatchMapView";
import { allMosquesInLondon } from "../../shared/allMosquesInLondon";
import { categories } from "../../shared/categoryData";
import { fetchMatches, setSearchDistance } from "../../redux/match/matchSlice";
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
  const { searchDistance } = useSelector((state) => state.matches || {});

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 }); // Default to London
  const [showMap, setShowMap] = useState(true);
  const [listingsView, setListingsView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilters, setActiveFilters] = useState({
    prayer: [],
    facilities: [],
    rating: null,
    distance: searchDistance !== undefined ? searchDistance : 20,
  });

  // Sync internal activeFilters.distance state with Redux searchDistance
  useEffect(() => {
    setActiveFilters((prev) => ({
      ...prev,
      distance: searchDistance !== undefined ? searchDistance : 20,
    }));
  }, [searchDistance]);

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
      if (activeFilters.prayer.length > 0) {
        const hasAllPrayers = activeFilters.prayer.every((prayer) =>
          mosque.prayers?.includes(prayer)
        );
        if (!hasAllPrayers) return false;
      }

      // Filter by facilities
      if (activeFilters.facilities.length > 0) {
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
    console.log("Dispatching fetchMatches...");
    dispatch(
      fetchMatches({ distance: activeFilters.distance, center: mapCenter })
    );
  }, [dispatch, activeFilters.distance, mapCenter]);

  // --- UI Toggle Functions ---
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  // --- Filter Change Handlers ---
  const handleFilterChange = (category, value) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (category === "prayer" || category === "facilities") {
        // Toggle array values
        if (newFilters[category].includes(value)) {
          newFilters[category] = newFilters[category].filter(
            (item) => item !== value
          );
        } else {
          newFilters[category] = [...newFilters[category], value];
        }
      } else if (category === "distance") {
        // Update distance filter
        newFilters[category] = value;
        dispatch(setSearchDistance(value));
      } else {
        // Update other single value filters (like rating)
        newFilters[category] = value;
      }

      return newFilters;
    });
  };

  const removeFilter = (category, value) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (category === "prayer" || category === "facilities") {
        // Remove item from array filters
        newFilters[category] = newFilters[category].filter(
          (item) => item !== value
        );
      } else if (category === "distance") {
        // Reset distance to default (20 miles)
        const defaultDistance = 20;
        newFilters[category] = defaultDistance;
        dispatch(setSearchDistance(defaultDistance));
      } else {
        // Reset other single value filters to null
        newFilters[category] = null;
      }

      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      prayer: [],
      facilities: [],
      rating: null,
      distance: activeFilters.distance, // Keep current distance filter value
    });
    setActiveCategory("all");
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
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
          removeFilter={removeFilter}
          clearAllFilters={clearAllFilters}
          filteredMosques={mosquesWithinDistance}
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
            handleMosqueClick={handleMosqueClick}
            mosquesToShow={fullyFilteredMosques}
          />
        </div>

        {/* Map Section */}
        {showMap && (
          <MatchMapView
            filteredMosques={mosquesWithinDistance}
            mapCenter={mapCenter}
            allMosques={allMosquesInLondon}
            activeFilters={activeFilters}
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

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
  setSearchMode,
  initializeUserMosques, // Renamed import
  saveMosqueFilters,
  loadMosqueFilters,
  clearSavedMosqueFilters,
  checkSavedFilters,
} from "../../redux/match/matchSlice";
import "./mosqueSearchPage.css";
import toast from "react-hot-toast";

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
    professionalMatches = [], // No longer directly used for display logic here, but for triggering fetch
    mosqueMatches = [], // No longer directly used for display logic here, but for triggering fetch
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
      selectedMosque: null, // This is updated directly by fetchMatchesByMosque fulfilled
    },
    loading = false,
    searchMode, // Get the searchMode from Redux state
    hasSavedFilters = false,
  } = useSelector((state) => state.matches || {});

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 }); // Default to London
  const [showMap, setShowMap] = useState(true);
  const [listingsView, setListingsView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all"); // This seems unused, consider removing if not needed.

  // Use the selectedMosque from Redux activeFilters directly
  const selectedMosqueForSearch = activeFilters.selectedMosque;

  // Effect to dispatch fetchMatches when filters or mapCenter change in professional mode
  useEffect(() => {
    // Only fetch professional matches if in professional mode AND no specific mosque is selected
    // professionalMatches.length === 0 added to prevent refetching if already populated
    if (
      searchMode === "professional" &&
      !selectedMosqueForSearch &&
      professionalMatches.length === 0 &&
      !loading
    ) {
      console.log("Dispatching fetchMatches for professional mode...");
      dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }));
      console.log(
        dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }))
      );
      console.log("Dispatching fetchMatches for professional mode...");
    }
  }, [
    dispatch,
    activeFilters,
    mapCenter,
    searchMode,
    selectedMosqueForSearch,
    professionalMatches.length,
    loading,
  ]);

  // Effect to dispatch fetchMatchesByMosque when selectedMosqueForSearch changes
  // This will be triggered by handleSearchInMosque and selectedMosque being set in redux
  useEffect(() => {
    if (
      searchMode === "mosque" &&
      selectedMosqueForSearch &&
      !mosqueMatches.length &&
      !loading
    ) {
      console.log(
        "Dispatching fetchMatchesByMosque because a mosque is selected and in mosque mode..."
      );
      dispatch(
        fetchMatchesByMosque({
          mosqueId: selectedMosqueForSearch.id,
          mosqueName: selectedMosqueForSearch.name,
        })
      );
    }
  }, [
    dispatch,
    searchMode,
    selectedMosqueForSearch,
    mosqueMatches.length,
    loading,
  ]);

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
    // Special handling for selectedMosques (multiple mosque selection)
    if (category === "selectedMosques") {
      // Remove specific mosque from the selectedMosques array via Redux
      dispatch(
        updateFilters({
          category: "selectedMosques",
          value: { id: value }, // Pass the mosque object with ID for removal logic in Redux
        })
      );

      // Get the updated mosques array after removal
      const currentMosques = activeFilters.selectedMosques || [];
      const updatedMosques = currentMosques.filter(
        (mosque) => mosque.id !== value
      );

      // If no mosques left, switch back to professional mode
      if (updatedMosques.length === 0) {
        dispatch(setSearchMode("professional"));
        // Clear mosque matches and load professional matches
        dispatch(clearMatches());
        dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }));
      } else {
        // Still have mosques selected, refetch matches for remaining mosques
        // Clear current matches first
        dispatch(clearMatches());

        // Fetch matches for each remaining mosque
        updatedMosques.forEach((mosque) => {
          dispatch(
            fetchMatchesByMosque({
              mosqueId: mosque.id,
              mosqueName: mosque.name,
            })
          );
        });
      }
    }
    // Special handling for single selectedMosque (keeping your existing logic)
    else if (category === "selectedMosque") {
      // Clear the selectedMosque and switch back to professional mode
      dispatch(updateFilters({ category: "selectedMosque", value: null }));
      dispatch(setSearchMode("professional"));

      // Clear mosque matches and fetch professional matches
      dispatch(clearMatches());
      dispatch(fetchMatches({ filters: activeFilters, center: mapCenter }));
    }
    // Handle other filter categories normally
    else {
      dispatch(removeFilterAction({ category, value }));
    }
  };

  const clearAllFilters = () => {
    dispatch(clearAllFiltersAction());
  };

  // Handler for clicking on a mosque item (for map centering)
  const handleMosqueClick = (item) => {
    console.log("Mosque clicked for map centering:", item);

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

  // Add this function to handle mosque-based search:
  const handleSearchInMosque = useCallback(
    (mosque) => {
      const mosqueId = mosque.id || mosque._id;
      const mosqueName = mosque.name; // Ensure name is passed

      // Dispatch action to set the selected mosque filter and fetch females attached to this mosque
      dispatch(
        updateFilters({
          category: "selectedMosque",
          value: { id: mosqueId, name: mosqueName },
        })
      );
      dispatch(
        fetchMatchesByMosque({
          mosqueId: mosqueId,
          mosqueName: mosqueName,
        })
      );
    },
    [dispatch]
  ); // searchedMosques is managed by Redux, no need for it here

  const handleSearchModeToggle = useCallback(() => {
    const newMode = searchMode === "professional" ? "mosque" : "professional";
    dispatch(setSearchMode(newMode)); // Dispatch the new search mode

    // If switching to professional mode, clear any selected mosque filter
    if (newMode === "professional") {
      dispatch(updateFilters({ category: "selectedMosque", value: null }));
      dispatch(clearMatches()); // Clear matches when switching mode
    } else {
      // If switching to mosque mode, ensure matches are cleared if there's no selected mosque yet
      if (!selectedMosqueForSearch) {
        dispatch(clearMatches());
      }
    }
  }, [searchMode, dispatch, selectedMosqueForSearch]);

  useEffect(() => {
    // Initialize user's attached mosques when switching to mosque mode
    if (searchMode === "mosque" && activeFilters.selectedMosques.length === 0) {
      dispatch(initializeUserMosques());
    }
  }, [searchMode, dispatch, activeFilters.selectedMosques.length]);

  useEffect(() => {
    // Fetch matches for all selected mosques in mosque mode
    if (
      searchMode === "mosque" &&
      activeFilters.selectedMosques.length > 0 &&
      mosqueMatches.length === 0 &&
      !loading
    ) {
      console.log("Fetching matches for selected mosques...");
      activeFilters.selectedMosques.forEach((mosque) => {
        dispatch(
          fetchMatchesByMosque({
            mosqueId: mosque.id,
            mosqueName: mosque.name,
          })
        );
      });
    }
  }, [
    dispatch,
    searchMode,
    activeFilters.selectedMosques,
    mosqueMatches.length,
    loading,
  ]);
  const clearMosqueSearch = useCallback(() => {
    // When clearing a specific mosque search, we set selectedMosque back to null
    dispatch(updateFilters({ category: "selectedMosque", value: null }));
    dispatch(clearMatches()); // Also clear the matches specific to that mosque
  }, [dispatch]);

  const toggleMap = () => setShowMap(!showMap);

  const handleSearchSubmit = () => {
    console.log("Dsa");
  };
  const toggleListingsView = () =>
    setListingsView(listingsView === "grid" ? "list" : "grid");

  const handleSaveMosqueSelection = useCallback(async () => {
    if (activeFilters.selectedMosques.length > 0) {
      try {
        await dispatch(
          saveMosqueFilters(activeFilters.selectedMosques)
        ).unwrap();
        toast.success(
          `Successfully saved ${activeFilters.selectedMosques.length} mosque${
            activeFilters.selectedMosques.length > 1 ? "s" : ""
          }`,
          {
            duration: 3000,
            position: "bottom-right",
            icon: "✅",
          }
        );
      } catch (error) {
        toast.error("Failed to save mosque selection", {
          duration: 4000,
          position: "bottom-right",
          icon: "❌",
        });
      }
    }
  }, [dispatch, activeFilters.selectedMosques]);

  const handleLoadSavedMosques = useCallback(async () => {
    try {
      const result = await dispatch(loadMosqueFilters()).unwrap();
      toast.success(
        `Successfully loaded ${result.length} saved mosque${
          result.length > 1 ? "s" : ""
        }`,
        {
          duration: 3000,
          position: "bottom-right",
          icon: "📋",
        }
      );
    } catch (error) {
      toast.error("Failed to load saved mosques", {
        duration: 4000,
        position: "bottom-right",
        icon: "❌",
      });
    }
  }, [dispatch]);

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
                  {searchMode === "professional"
                    ? `Within ${activeFilters.distance} miles`
                    : selectedMosqueForSearch
                    ? `Matches from ${selectedMosqueForSearch.name}`
                    : `Select a mosque on the map to view matches`}
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

            {searchMode === "mosque" && (
              <div className="flex gap-2 mt-2">
                {activeFilters.selectedMosques.length > 0 && (
                  <button
                    onClick={handleSaveMosqueSelection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Selection
                  </button>
                )}

                <button
                  onClick={handleLoadSavedMosques}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Load Saved
                </button>
              </div>
            )}
            {/* Active Filters Display */}
            <ActiveFilters
              activeFilters={activeFilters}
              removeFilter={removeFilter}
              clearAllFilters={clearAllFilters}
            />
            {/* Display selected mosque and clear button if in mosque mode */}
            {searchMode === "mosque" && selectedMosqueForSearch && (
              <div className="flex items-center mt-2 p-2 bg-blue-50 rounded-md">
                <span className="text-sm font-medium text-blue-800">
                  Showing matches for: {selectedMosqueForSearch.name}
                </span>
                <button
                  onClick={clearMosqueSearch}
                  className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                >
                  Clear Mosque Selection
                </button>
              </div>
            )}
          </div>

          {/* Mosque Listings Cards */}

          <MatchListings
            listingsView={listingsView}
            handleMatchClick={handleMatchClick}
            matchesToShow={matches} // This will now correctly reflect searchMode
            loading={loading}
          />
        </div>

        {/* Map View Section */}
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
    </div>
  );
}

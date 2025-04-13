"use client";

import { useState, useEffect } from "react";
import Header from "../../components/mosqueSearch/Header";
import CategoryNav from "../../components/mosqueSearch/CategoryNav";
import FilterModal from "../../components/mosqueSearch/FilterModal";
import ActiveFilters from "../../components/mosqueSearch/ActiveFilters";
import MosqueListings from "../../components/mosqueSearch/MosqueListings";
import MapView from "../../components/mosqueSearch/MapView";
import { mosqueData } from "../../shared/mosqueData";
import { categories } from "../../shared/categoryData";
import "./mosqueSearchPage.css";

export default function MosqueSearchPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 });
  const [showMap, setShowMap] = useState(true);
  const [listingsView, setListingsView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilters, setActiveFilters] = useState({
    prayer: [],
    facilities: [],
    rating: null,
    distance: 10, // Default single distance value
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (category, value) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (category === "prayer" || category === "facilities") {
        if (newFilters[category].includes(value)) {
          newFilters[category] = newFilters[category].filter(
            (item) => item !== value
          );
        } else {
          newFilters[category] = [...newFilters[category], value];
        }
      } else {
        newFilters[category] = value;
      }

      return newFilters;
    });
  };

  const removeFilter = (category, value) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (category === "prayer" || category === "facilities") {
        newFilters[category] = newFilters[category].filter(
          (item) => item !== value
        );
      } else if (category === "distance") {
        newFilters[category] = 10; // Reset to default distance
      } else {
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
      distance: 10, // Reset to default distance
    });
    setActiveCategory("all");
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleMarkerClick = (mosque) => {
    setSelectedMosque(mosque);
    setMapCenter(mosque.location);
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const toggleListingsView = () => {
    setListingsView(listingsView === "grid" ? "list" : "grid");
  };

  const handleSearchSubmit = (query) => {
    console.log("Search submitted:", query);
    // Implement search functionality here
  };

  const filteredMosques = mosqueData?.filter((mosque) => {
    // Filter by category
    if (
      activeCategory !== "all" &&
      !mosque.categories.includes(activeCategory)
    ) {
      return false;
    }

    // Filter by prayer types
    if (activeFilters.prayer.length > 0) {
      const hasAllPrayers = activeFilters.prayer.every((prayer) =>
        mosque.prayers.includes(prayer)
      );
      if (!hasAllPrayers) return false;
    }

    // Filter by facilities
    if (activeFilters.facilities.length > 0) {
      const hasAllFacilities = activeFilters.facilities.every((facility) =>
        mosque.facilities.includes(facility)
      );
      if (!hasAllFacilities) return false;
    }

    // Filter by rating
    if (activeFilters.rating && mosque.rating < activeFilters.rating) {
      return false;
    }

    // Note: Distance filtering would typically require user location
    // and calculation of actual distance to each mosque

    return true;
  });

  return (
    <>
      <div className="bg-white min-h-screen">
        {/* Main Navigation */}
        <Header
          onSearchSubmit={handleSearchSubmit}
          toggleFilter={toggleFilter}
          toggleMap={toggleMap}
          activeFilters={activeFilters}
          handleFilterChange={handleFilterChange}
          showMap={showMap}
        />

        {/* Category Navigation */}
        {/* <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          handleCategoryChange={handleCategoryChange}
        /> */}

        {/* Filter Modal */}
        {isFilterOpen && (
          <FilterModal
            toggleFilter={toggleFilter}
            activeFilters={activeFilters}
            handleFilterChange={handleFilterChange}
            clearAllFilters={clearAllFilters}
            filteredMosques={filteredMosques}
          />
        )}

        {/* Main Content */}
        <div className="pt-32 md:pt-36 flex flex-col md:flex-row">
          {/* Mosque Listings */}
          <div
            className={`${
              showMap ? "w-full md:w-3/5 lg:w-7/12" : "w-full"
            } transition-all duration-300`}
          >
            <div className="px-4 py-2 sticky top-12 bg-white z-20 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h1 className="text-lg font-semibold">Mosques in London</h1>
                  <p className="text-sm text-gray-600">
                    {filteredMosques.length} mosques found
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={toggleListingsView}
                    className="p-2 rounded-full hover:bg-gray-100"
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

              {/* Active Filters */}
              <ActiveFilters
                activeFilters={activeFilters}
                removeFilter={removeFilter}
                clearAllFilters={clearAllFilters}
              />
            </div>

            {/* Mosque Cards */}
            <MosqueListings
              mosques={filteredMosques}
              listingsView={listingsView}
              handleMarkerClick={handleMarkerClick}
              clearAllFilters={clearAllFilters}
            />
          </div>

          {/* Map Section */}
          {showMap && (
            <MapView
              filteredMosques={filteredMosques}
              selectedMosque={selectedMosque}
              setSelectedMosque={setSelectedMosque}
              mapCenter={mapCenter}
            />
          )}
        </div>

        {/* Mobile Filter Button - Fixed to bottom on small screens */}
        <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-20">
          <button
            onClick={toggleFilter}
            className="bg-primary text-white rounded-full px-6 py-3 shadow-lg flex items-center"
          >Filter</button>
        </div>
      </div>
    </>
  );
}

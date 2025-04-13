import { useState } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";

export default function MapFilterBar({
  activeFilters,
  handleFilterChange,
  openFullFilter,
  filteredCount,
}) {
  const [showPrayerDropdown, setShowPrayerDropdown] = useState(false);
  const [showFacilitiesDropdown, setShowFacilitiesDropdown] = useState(false);

  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jummah"];
  const facilities = [
    "Wudu Area",
    "Women's Section",
    "Classes",
    "Library",
    "Community Events",
    "Parking",
    "Wheelchair Access",
  ];

  return (
    <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
      <div className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 max-w-3xl w-full mx-4">
        {/* Quick filter buttons */}
        <div className="relative">
          <button
            className="px-3 py-2 rounded-full hover:bg-gray-100 text-sm font-medium flex items-center gap-1"
            onClick={() => setShowPrayerDropdown(!showPrayerDropdown)}
          >
            Prayer
            <ChevronDown size={16} />
          </button>

          {showPrayerDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-10 w-48 p-2">
              {prayers.map((prayer) => (
                <div
                  key={prayer}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => {
                    handleFilterChange("prayer", prayer);
                    setShowPrayerDropdown(false);
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                      activeFilters.prayer.includes(prayer)
                        ? "bg-primary border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {activeFilters.prayer.includes(prayer) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="ml-2 text-sm">{prayer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="px-3 py-2 rounded-full hover:bg-gray-100 text-sm font-medium flex items-center gap-1"
            onClick={() => setShowFacilitiesDropdown(!showFacilitiesDropdown)}
          >
            Facilities
            <ChevronDown size={16} />
          </button>

          {showFacilitiesDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-10 w-48 p-2">
              {facilities.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => {
                    handleFilterChange("facilities", facility);
                    setShowFacilitiesDropdown(false);
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                      activeFilters.facilities.includes(facility)
                        ? "bg-primary border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {activeFilters.facilities.includes(facility) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="ml-2 text-sm">{facility}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating filter */}
        <div className="flex gap-1">
          {[3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              className={`px-3 py-2 rounded-full text-sm ${
                activeFilters.rating === rating
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleFilterChange("rating", rating)}
            >
              {rating}+★
            </button>
          ))}
        </div>

        {/* Distance quick filters */}
        <div className="flex gap-1">
          {[1, 5, 10].map((distance) => (
            <button
              key={distance}
              className={`px-3 py-2 rounded-full text-sm ${
                activeFilters.distance === distance
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleFilterChange("distance", distance)}
            >
              {distance} km
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <button
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium flex items-center gap-2"
            onClick={openFullFilter}
          >
            <Filter size={16} />
            All Filters
            {(activeFilters.prayer.length > 0 ||
              activeFilters.facilities.length > 0 ||
              activeFilters.rating ||
              activeFilters.distance) && (
              <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {filteredCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

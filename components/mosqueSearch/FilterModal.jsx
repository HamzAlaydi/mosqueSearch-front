"use client";

import { X, Star } from "lucide-react";
import { useState, useEffect } from "react";

export default function FilterModal({
  toggleFilter = () => {},
  activeFilters = {
    prayer: [],
    facilities: [],
    rating: null,
    distance: null,
  },
  handleFilterChange = () => {},
  clearAllFilters = () => {},
  filteredMosques = [],
} = {}) {
  return (
    <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button
            onClick={toggleFilter}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Prayer Types */}
          <div>
            <h3 className="font-semibold mb-4">Prayer Types</h3>
            <div className="flex flex-wrap gap-3">
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jummah"].map(
                (prayer) => (
                  <button
                    key={prayer}
                    className={`px-4 py-2 rounded-full border ${
                      activeFilters?.prayer?.includes(prayer)
                        ? "border-primary bg-primary bg-opacity-10 text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleFilterChange("prayer", prayer)}
                  >
                    {prayer}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="font-semibold mb-4">Facilities</h3>
            <div className="flex flex-wrap gap-3">
              {[
                "Wudu Area",
                "Women's Section",
                "Classes",
                "Library",
                "Community Events",
                "Parking",
                "Wheelchair Access",
              ].map((facility) => (
                <button
                  key={facility}
                  className={`px-4 py-2 rounded-full border ${
                    activeFilters?.facilities?.includes(facility)
                      ? "border-primary bg-primary bg-opacity-10 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleFilterChange("facilities", facility)}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold mb-4">Rating</h3>
            <div className="flex gap-3">
              {[3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  className={`px-4 py-2 rounded-full border flex items-center gap-1 ${
                    activeFilters?.rating === rating
                      ? "border-primary bg-primary bg-opacity-10 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleFilterChange("rating", rating)}
                >
                  {rating}+{" "}
                  <Star
                    size={16}
                    fill={activeFilters?.rating === rating ? "#24936e" : "none"}
                    stroke={
                      activeFilters?.rating === rating
                        ? "#24936e"
                        : "currentColor"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Prayer Times */}
          <div>
            <h3 className="font-semibold mb-4">Prayer Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Earliest
                </label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option>Any time</option>
                  <option>4:00 AM</option>
                  <option>5:00 AM</option>
                  <option>12:00 PM</option>
                  <option>1:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Latest
                </label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option>Any time</option>
                  <option>2:00 PM</option>
                  <option>6:00 PM</option>
                  <option>9:00 PM</option>
                  <option>10:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={clearAllFilters}
            className="text-gray-600 underline text-sm"
          >
            Clear all
          </button>
          <button
            onClick={toggleFilter}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 font-medium transition-all"
          >
            Show {filteredMosques.length} mosques
          </button>
        </div>
      </div>
    </div>
  );
}

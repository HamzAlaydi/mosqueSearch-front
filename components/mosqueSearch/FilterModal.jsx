"use client";

import { X, Star } from "lucide-react";
import { useState } from "react";

export default function FilterModal({
  toggleFilter = () => {},
  activeFilters = {},
  handleFilterChange = () => {},
  clearAllFilters = () => {},
  filteredMatches = [],
} = {}) {
  const safeFilters = {
    religiousness: [],
    maritalStatus: [],
    ageRange: { min: 18, max: 65 },
    hasChildren: [],
    childrenDesire: [],
    educationLevel: [],
    profession: [],
    willingToRelocate: null,
    distance: 20,
    ...activeFilters,
  };
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
          {/* Age Range */}
          <div>
            <h3 className="font-semibold mb-4">Age Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Min Age
                </label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={activeFilters.ageRange?.min || 18}
                  onChange={(e) =>
                    handleFilterChange("ageRange", {
                      ...activeFilters.ageRange,
                      min: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <span className="text-sm font-medium">
                  {activeFilters.ageRange?.min || 18} years
                </span>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Max Age
                </label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={activeFilters.ageRange?.max || 65}
                  onChange={(e) =>
                    handleFilterChange("ageRange", {
                      ...activeFilters.ageRange,
                      max: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <span className="text-sm font-medium">
                  {activeFilters.ageRange?.max || 65} years
                </span>
              </div>
            </div>
          </div>

          {/* Religiousness */}
          <div>
            <h3 className="font-semibold mb-4">Religiousness</h3>
            <div className="flex flex-wrap gap-3">
              {[
                "very_religious",
                "religious",
                "moderately_religious",
                "somewhat_religious",
                "not_religious",
              ].map((level) => {
                // Convert API value to display text
                const displayText = level
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                return (
                  <button
                    key={level}
                    className={`px-4 py-2 rounded-full border ${
                      activeFilters?.religiousness?.includes(level)
                        ? "border-primary bg-primary bg-opacity-10 text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleFilterChange("religiousness", level)}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marital Status */}
          <div>
            <h3 className="font-semibold mb-4">Marital Status</h3>
            <div className="flex flex-wrap gap-3">
              {["single", "divorced", "widowed"].map((status) => {
                const displayText =
                  status.charAt(0).toUpperCase() + status.slice(1);

                return (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full border ${
                      activeFilters?.maritalStatus?.includes(status)
                        ? "border-primary bg-primary bg-opacity-10 text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleFilterChange("maritalStatus", status)}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Children Status */}
          <div>
            <h3 className="font-semibold mb-4">Has Children</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  className={`px-4 py-2 rounded-full border ${
                    activeFilters?.hasChildren?.includes(value)
                      ? "border-primary bg-primary bg-opacity-10 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleFilterChange("hasChildren", value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Children Desire */}
          <div>
            <h3 className="font-semibold mb-4">Wants Children</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "open", label: "Open to it" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  className={`px-4 py-2 rounded-full border ${
                    activeFilters?.childrenDesire?.includes(value)
                      ? "border-primary bg-primary bg-opacity-10 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleFilterChange("childrenDesire", value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Education Level */}
          <div>
            <h3 className="font-semibold mb-4">Education Level</h3>
            <div className="flex flex-wrap gap-3">
              {["high_school", "bachelor", "master", "phd", "other"].map(
                (level) => {
                  // Convert API value to display text
                  const displayText =
                    level === "high_school"
                      ? "High School"
                      : level.charAt(0).toUpperCase() + level.slice(1);

                  return (
                    <button
                      key={level}
                      className={`px-4 py-2 rounded-full border ${
                        activeFilters?.educationLevel?.includes(level)
                          ? "border-primary bg-primary bg-opacity-10 text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() =>
                        handleFilterChange("educationLevel", level)
                      }
                    >
                      {displayText}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Profession */}
          <div>
            <h3 className="font-semibold mb-4">Profession</h3>
            <div className="flex flex-wrap gap-3">
              {[
                "healthcare",
                "education",
                "engineering",
                "business",
                "technology",
                "arts",
                "law",
                "student",
                "other",
              ].map((profession) => {
                const displayText =
                  profession.charAt(0).toUpperCase() + profession.slice(1);

                return (
                  <button
                    key={profession}
                    className={`px-4 py-2 rounded-full border ${
                      activeFilters?.profession?.includes(profession)
                        ? "border-primary bg-primary bg-opacity-10 text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleFilterChange("profession", profession)}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Willing to Relocate */}
          <div>
            <h3 className="font-semibold mb-4">Willing to Relocate</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map(({ value, label }) => (
                <button
                  key={String(value)}
                  className={`px-4 py-2 rounded-full border ${
                    activeFilters?.willingToRelocate === value
                      ? "border-primary bg-primary bg-opacity-10 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleFilterChange("willingToRelocate", value)}
                >
                  {label}
                </button>
              ))}
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
            Show {filteredMatches.length} matches
          </button>
        </div>
      </div>
    </div>
  );
}

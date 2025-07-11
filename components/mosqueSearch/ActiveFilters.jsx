// Replace the existing FilterTag component

import { X, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

const FilterTag = ({
  category,
  value,
  displayValue,
  removeFilter,
  isDefault = false,
}) => {
  let finalDisplayValue = displayValue || value;
  const baseClasses =
    "rounded-full px-3 py-1.5 flex items-center gap-2 text-sm font-medium transition-all duration-200";

  // Special styling for mosque filters
  if (category === "selectedMosques") {
    const mosqueClasses = isDefault
      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200 shadow-sm"
      : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border border-gray-200 shadow-sm hover:shadow-md";

    return (
      <div className={`${baseClasses} ${mosqueClasses}`}>
        <div className="flex items-center gap-1.5">
          {isDefault && (
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                title="Your attached mosque"
              />
              <MapPin size={14} className="text-blue-600" />
            </div>
          )}
          {!isDefault && <MapPin size={14} className="text-gray-600" />}
          <span className="font-semibold">{finalDisplayValue}</span>
        </div>
        <button
          onClick={() => removeFilter(category, value)}
          className={`ml-1 p-0.5 rounded-full hover:bg-white/50 transition-colors ${
            isDefault
              ? "text-blue-600 hover:text-blue-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Default styling for other filters
  const defaultClasses = "bg-gray-100 text-gray-800 hover:bg-gray-200";

  // Format display values based on category
  if (
    category === "religiousness" ||
    category === "educationLevel" ||
    category === "maritalStatus"
  ) {
    // Convert snake_case to Title Case
    finalDisplayValue = value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else if (category === "profession") {
    // Capitalize first letter
    finalDisplayValue = value.charAt(0).toUpperCase() + value.slice(1);
  } else if (category === "willingToRelocate") {
    finalDisplayValue = value
      ? "Willing to Relocate"
      : "Not Willing to Relocate";
  } else if (category === "hasChildren" || category === "childrenDesire") {
    if (value === "yes")
      finalDisplayValue =
        category === "hasChildren" ? "Has Children" : "Wants Children";
    else if (value === "no")
      finalDisplayValue =
        category === "hasChildren" ? "No Children" : "Doesn't Want Children";
    else if (value === "open") finalDisplayValue = "Open to Children";
  } else if (category === "ageRange") {
    // For ageRange, 'value' is an object {min, max}
    finalDisplayValue = `Age ${value.min}-${value.max}`;
  } else if (category === "distance") {
    finalDisplayValue = `Within ${value} miles`;
  }

  return (
    <div className={`${baseClasses} ${defaultClasses}`}>
      <span>{finalDisplayValue}</span>
      <button
        onClick={() => removeFilter(category, value)}
        className="ml-1 text-gray-500 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// New Mosque Dropdown Component
const MosqueDropdown = ({ selectedMosques, removeFilter }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest(".mosque-dropdown")) {
      setIsOpen(false);
    }
  };

  // Add event listener when dropdown is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (!selectedMosques || selectedMosques.length === 0) {
    return null;
  }

  const defaultMosques = selectedMosques.filter((mosque) => mosque.isDefault);
  const additionalMosques = selectedMosques.filter(
    (mosque) => !mosque.isDefault
  );

  return (
    <div className="relative mosque-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200 shadow-sm rounded-full px-3 py-1.5 flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:shadow-md"
      >
        <MapPin size={14} className="text-blue-600" />
        <span className="font-semibold">
          Attached Mosques ({selectedMosques.length})
        </span>
        {isOpen ? (
          <ChevronUp size={14} className="text-blue-600" />
        ) : (
          <ChevronDown size={14} className="text-blue-600" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
              SELECTED MOSQUES
            </div>

            {/* Default/Attached Mosques */}
            {defaultMosques.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-medium text-blue-600 mb-1 px-2">
                  Your Attached Mosques
                </div>
                {defaultMosques.map((mosque) => (
                  <div
                    key={mosque.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">{mosque.name}</span>
                    </div>
                    <button
                      onClick={() => removeFilter("selectedMosques", mosque.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Selected Mosques */}
            {additionalMosques.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1 px-2">
                  Additional Mosques
                </div>
                {additionalMosques.map((mosque) => (
                  <div
                    key={mosque.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-gray-500" />
                      <span className="text-sm font-medium">{mosque.name}</span>
                    </div>
                    <button
                      onClick={() => removeFilter("selectedMosques", mosque.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ActiveFilters({
  activeFilters,
  selectedMosques = [],
  removeFilter,
  clearAllFilters,
}) {
  // Check if there are no active filters to decide whether to render the component at all.
  const hasNoFilters =
    (activeFilters.religiousness?.length || 0) === 0 &&
    (activeFilters.maritalStatus?.length || 0) === 0 &&
    (activeFilters.hasChildren?.length || 0) === 0 &&
    (activeFilters.childrenDesire?.length || 0) === 0 &&
    (activeFilters.educationLevel?.length || 0) === 0 &&
    (activeFilters.profession?.length || 0) === 0 &&
    activeFilters.willingToRelocate === null &&
    activeFilters.selectedMosque === null && // Check for single selected mosque
    (selectedMosques?.length || 0) === 0 && // Check for multiple selected mosques
    (!activeFilters.ageRange ||
      (activeFilters.ageRange.min === 18 &&
        activeFilters.ageRange.max === 65)) &&
    (!activeFilters.distance || activeFilters.distance === 20);

  // If no active filters, return null to not render anything
  if (hasNoFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {/* Age Range Filter */}
      {activeFilters.ageRange &&
        (activeFilters.ageRange.min !== 18 ||
          activeFilters.ageRange.max !== 65) && (
          <FilterTag
            key="age-range" // Unique key is important
            category="ageRange"
            value={activeFilters.ageRange}
            removeFilter={removeFilter}
          />
        )}

      {/* Array-based filters (religiousness, maritalStatus, hasChildren, childrenDesire, educationLevel, profession) */}
      {activeFilters.religiousness?.map((value) => (
        <FilterTag
          key={`religiousness-${value}`}
          category="religiousness"
          value={value}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.maritalStatus?.map((status) => (
        <FilterTag
          key={`marital-${status}`}
          category="maritalStatus"
          value={status}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.hasChildren?.map((value) => (
        <FilterTag
          key={`children-${value}`}
          category="hasChildren"
          value={value}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.childrenDesire?.map((value) => (
        <FilterTag
          key={`desire-${value}`}
          category="childrenDesire"
          value={value}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.educationLevel?.map((level) => (
        <FilterTag
          key={`education-${level}`}
          category="educationLevel"
          value={level}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.profession?.map((profession) => (
        <FilterTag
          key={`profession-${profession}`}
          category="profession"
          value={profession}
          removeFilter={removeFilter}
        />
      ))}

      {/* Boolean filter (willingToRelocate) */}
      {activeFilters.willingToRelocate !== null && (
        <FilterTag
          category="willingToRelocate"
          value={activeFilters.willingToRelocate}
          removeFilter={removeFilter}
        />
      )}

      {/* Distance filter (if not default) */}
      {activeFilters.distance && activeFilters.distance !== 20 && (
        <FilterTag
          category="distance"
          value={activeFilters.distance}
          removeFilter={removeFilter}
        />
      )}

      {/* Mosque Dropdown - replaces individual mosque tags */}
      {/* <MosqueDropdown
        selectedMosques={selectedMosques}
        removeFilter={removeFilter}
      />

      <button
        onClick={clearAllFilters}
        className="text-primary hover:underline text-sm ml-2"
      >
        Clear all
      </button> */}
    </div>
  );
}

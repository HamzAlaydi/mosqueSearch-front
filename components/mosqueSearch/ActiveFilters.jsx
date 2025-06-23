import { X } from "lucide-react";

const FilterTag = ({
  category,
  value,
  displayValue,
  removeFilter,
  isDefault = false,
}) => {
  let finalDisplayValue = displayValue || value;
  const baseClasses = "rounded-full px-3 py-1 flex items-center gap-1 text-sm";
  const defaultMosqueClasses = isDefault
    ? "bg-blue-100 text-blue-800 border border-blue-200"
    : "bg-gray-100";

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
  // For 'selectedMosques', 'finalDisplayValue' will already be the mosque name passed via 'displayValue' prop.

  return (
    <div className={`${baseClasses} ${defaultMosqueClasses}`}>
      {isDefault && (
        <span
          className="w-2 h-2 bg-blue-500 rounded-full mr-1"
          title="Your attached mosque"
        />
      )}
      {finalDisplayValue}
      <button
        onClick={() => removeFilter(category, value)}
        className={`ml-1 hover:text-gray-700 ${
          isDefault ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default function ActiveFilters({
  activeFilters,
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
    (activeFilters.selectedMosques?.length || 0) === 0 && // Check for multiple selected mosques
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

      {/* IMPORTANT: Handling multiple selected mosques */}
      {activeFilters.selectedMosques?.map((mosque) => (
        <FilterTag
          key={`selected-mosque-${mosque.id}`}
          category="selectedMosques"
          value={mosque.id}
          displayValue={mosque.name}
          isDefault={mosque.isDefault} // Pass the isDefault flag
          removeFilter={removeFilter}
        />
      ))}

      <button
        onClick={clearAllFilters}
        className="text-primary hover:underline text-sm ml-2"
      >
        Clear all
      </button>
    </div>
  );
}

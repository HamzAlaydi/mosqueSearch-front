import { X } from "lucide-react";

const FilterTag = ({ category, value, removeFilter }) => {
  // Format display values based on category
  let displayValue = value;

  if (
    category === "religiousness" ||
    category === "educationLevel" ||
    category === "maritalStatus"
  ) {
    // Convert snake_case to Title Case
    displayValue = value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else if (category === "profession") {
    // Capitalize first letter
    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
  } else if (category === "willingToRelocate") {
    displayValue = value ? "Willing to Relocate" : "Not Willing to Relocate";
  } else if (category === "hasChildren" || category === "childrenDesire") {
    if (value === "yes")
      displayValue =
        category === "hasChildren" ? "Has Children" : "Wants Children";
    else if (value === "no")
      displayValue =
        category === "hasChildren" ? "No Children" : "Doesn't Want Children";
    else if (value === "open") displayValue = "Open to Children";
  } else if (category === "ageRange") {
    displayValue = `Age ${value.min}-${value.max}`;
  } else if (category === "distance") {
    displayValue = `Within ${value} miles`;
  }

  return (
    <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1 text-sm">
      {displayValue}
      <button
        onClick={() => removeFilter(category, value)}
        className="ml-1 text-gray-500 hover:text-gray-700"
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
  // Check if there are no active filters
  const hasNoFilters =
    (activeFilters.religiousness?.length || 0) === 0 &&
    (activeFilters.maritalStatus?.length || 0) === 0 &&
    (activeFilters.hasChildren?.length || 0) === 0 &&
    (activeFilters.childrenDesire?.length || 0) === 0 &&
    (activeFilters.educationLevel?.length || 0) === 0 &&
    (activeFilters.profession?.length || 0) === 0 &&
    activeFilters.willingToRelocate === null &&
    (!activeFilters.ageRange ||
      (activeFilters.ageRange.min === 18 &&
        activeFilters.ageRange.max === 65)) &&
    (!activeFilters.distance || activeFilters.distance === 20);

  // Skip rendering if no active filters
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
            key="age-range"
            category="ageRange"
            value={activeFilters.ageRange}
            removeFilter={removeFilter}
          />
        )}

      {/* Array-based filters */}
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

      {/* Boolean filter */}
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

      <button
        onClick={clearAllFilters}
        className="text-primary hover:underline text-sm ml-2"
      >
        Clear all
      </button>
    </div>
  );
}

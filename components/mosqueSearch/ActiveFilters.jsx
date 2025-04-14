import { X } from "lucide-react";

const FilterTag = ({ category, value, removeFilter }) => (
  <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1 text-sm">
    {value}
    <button
      onClick={() => removeFilter(category, value)}
      className="ml-1 text-gray-500 hover:text-gray-700"
    >
      <X size={16} />
    </button>
  </div>
);

export default function ActiveFilters({
  activeFilters,
  removeFilter,
  clearAllFilters,
}) {
  // Skip rendering if no active filters
  if (
    activeFilters.prayer.length === 0 &&
    activeFilters.facilities.length === 0 &&
    !activeFilters.rating &&
    !activeFilters.distance
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {activeFilters.prayer.map((prayer) => (
        <FilterTag
          key={`prayer-${prayer}`}
          category="prayer"
          value={prayer}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.facilities.map((facility) => (
        <FilterTag
          key={`facility-${facility}`}
          category="facilities"
          value={facility}
          removeFilter={removeFilter}
        />
      ))}

      {activeFilters.rating && (
        <FilterTag
          category="rating"
          value={`${activeFilters.rating}+ Stars`}
          removeFilter={removeFilter}
        />
      )}

      {activeFilters.distance && (
        <FilterTag
          category="distance"
          value={`Within ${activeFilters.distance} miles`}
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

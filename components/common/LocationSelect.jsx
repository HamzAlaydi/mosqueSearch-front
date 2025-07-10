// components/common/LocationSelect.jsx
"use client";
import { useCallback } from "react";
import AsyncSelect from "react-select/async";
import { createLocationSearchFunction } from "@/shared/services/locationService";

const LocationSelect = ({
  value,
  onChange,
  name,
  placeholder = "Search for any location, city, zip code, or address",
  className = "react-select-container",
  isRequired = false,
}) => {
  // Create a memoized function to load location options
  const loadOptions = useCallback(createLocationSearchFunction(), []);

  // Convert value to the format expected by AsyncSelect
  const selectedValue = value ? { value, label: value } : null;

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={selectedValue}
      onChange={(option) => {
        // Pass the location details to the onChange callback
        const locationDetails = option
          ? {
              location: option.location || null,
              placeId: option.placeId || null,
            }
          : null;
        onChange(name, option?.label || "", locationDetails);
      }}
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      aria-required={isRequired}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 3
          ? "Type at least 3 characters to search"
          : "No locations found"
      }
      loadingMessage={() => "Searching..."}
    />
  );
};

export default LocationSelect;
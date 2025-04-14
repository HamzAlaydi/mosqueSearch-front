// components/common/CountrySelect.jsx
"use client";
import { useCallback, useState, useEffect } from "react";
import AsyncSelect from "react-select/async";

// Custom hook to load the initial selected country
const useSelectedCountry = (countryCode) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSelectedCountry = async () => {
      if (!countryCode) {
        setSelectedCountry(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${countryCode}`
        );
        if (!response.ok) {
          throw new Error("Country not found");
        }

        const [country] = await response.json();
        setSelectedCountry({
          value: country.cca2,
          label: country.name.common,
          flagUrl: country.flags.svg,
        });
      } catch (error) {
        console.error("Error loading selected country:", error);
        // Fallback to just showing the code
        setSelectedCountry({
          value: countryCode,
          label: countryCode,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedCountry();
  }, [countryCode]);

  return { selectedCountry, loading };
};

const CountrySelect = ({
  value,
  onChange,
  name,
  placeholder = "Select country",
  className = "react-select-container",
  isRequired = false,
}) => {
  // Use custom hook to load the selected country
  const { selectedCountry, loading } = useSelectedCountry(value);

  // Create a memoized function to load country options with REST Countries API
  const loadCountryOptions = useCallback(async (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }

    try {
      // Using REST Countries API which is free and includes flag data
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(inputValue)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No countries found for the search term
          return [];
        }
        throw new Error("Failed to fetch countries");
      }

      const countries = await response.json();
      return countries.map((country) => ({
        value: country.cca2, // ISO 3166-1 alpha-2 code
        label: country.name.common,
        flagUrl: country.flags.svg, // SVG flag URL
      }));
    } catch (error) {
      console.error("Error searching countries:", error);
      return [];
    }
  }, []);

  // Format the select option to include flags
  const formatOptionLabel = ({ label, flagUrl }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {flagUrl && (
        <img
          src={flagUrl}
          alt={`${label} flag`}
          style={{ width: "20px", height: "15px", marginRight: "10px" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadCountryOptions}
      getOptionValue={(option) => option.value}
      getOptionLabel={(option) => option.label}
      formatOptionLabel={formatOptionLabel}
      value={selectedCountry}
      isLoading={loading}
      loadingMessage={() => "Loading countries..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2
          ? "Type at least 2 characters to search"
          : "No countries found"
      }
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      aria-required={isRequired}
      onChange={(option) => onChange(name, option?.value || "")}
      cacheUniqueId={name}
    />
  );
};

export default CountrySelect;

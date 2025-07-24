// components/common/CountrySelect.jsx
"use client";
import { useCallback, useState, useEffect } from "react";
import AsyncSelect from "react-select/async";

// Popular countries list (you can customize this based on your needs)
const POPULAR_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" },
  { code: "MX", name: "Mexico" },
];

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

// Custom hook to load popular countries
const usePopularCountries = () => {
  const [popularCountries, setPopularCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularCountries = async () => {
      try {
        // Fetch all popular countries in one request
        const countryCodes = POPULAR_COUNTRIES.map(
          (country) => country.code
        ).join(",");
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha?codes=${countryCodes}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch popular countries");
        }

        const countries = await response.json();

        // Map and sort according to our popular countries order
        const sortedCountries = POPULAR_COUNTRIES.map((popularCountry) => {
          const country = countries.find((c) => c.cca2 === popularCountry.code);
          return country
            ? {
                value: country.cca2,
                label: country.name.common,
                flagUrl: country.flags.svg,
              }
            : {
                value: popularCountry.code,
                label: popularCountry.name,
              };
        }).filter(Boolean);

        setPopularCountries(sortedCountries);
      } catch (error) {
        console.error("Error loading popular countries:", error);
        // Fallback to basic popular countries without flags
        setPopularCountries(
          POPULAR_COUNTRIES.map((country) => ({
            value: country.code,
            label: country.name,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCountries();
  }, []);

  return { popularCountries, loading };
};

const CountrySelect = ({
  value,
  onChange,
  name,
  placeholder = "Select country",
  className = "react-select-container",
  isRequired = false,
}) => {
  // Use custom hooks
  const { selectedCountry, loading: selectedLoading } =
    useSelectedCountry(value);
  const { popularCountries, loading: popularLoading } = usePopularCountries();

  // Create a memoized function to load country options
  const loadCountryOptions = useCallback(
    async (inputValue) => {
      // If no input, return popular countries
      if (!inputValue || inputValue.length === 0) {
        return popularCountries;
      }

      // If input is less than 2 characters, still show popular countries
      if (inputValue.length < 2) {
        // Filter popular countries by input
        return popularCountries.filter((country) =>
          country.label.toLowerCase().includes(inputValue.toLowerCase())
        );
      }

      try {
        // Search all countries using REST Countries API
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(
            inputValue
          )}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            // No countries found, try to filter popular countries as fallback
            return popularCountries.filter((country) =>
              country.label.toLowerCase().includes(inputValue.toLowerCase())
            );
          }
          throw new Error("Failed to fetch countries");
        }

        const countries = await response.json();
        return countries.map((country) => ({
          value: country.cca2,
          label: country.name.common,
          flagUrl: country.flags.svg,
        }));
      } catch (error) {
        console.error("Error searching countries:", error);
        // Fallback to filtering popular countries
        return popularCountries.filter((country) =>
          country.label.toLowerCase().includes(inputValue.toLowerCase())
        );
      }
    },
    [popularCountries]
  );

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
      defaultOptions={popularCountries.length > 0 ? popularCountries : true}
      loadOptions={loadCountryOptions}
      getOptionValue={(option) => option.value}
      getOptionLabel={(option) => option.label}
      formatOptionLabel={formatOptionLabel}
      value={selectedCountry}
      isLoading={selectedLoading || popularLoading}
      loadingMessage={() => "Loading countries..."}
      noOptionsMessage={({ inputValue }) =>
        !inputValue || inputValue.length === 0
          ? "Loading popular countries..."
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

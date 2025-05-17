"use client";
import { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { ErrorMessage } from "formik";

const animatedComponents = makeAnimated();

const LanguageSelect = ({ value, onChange, name, placeholder }) => {
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try: Fetch from a reliable language API
        // Using REST Countries API as it's free, reliable, and has good performance
        const countriesResponse = await fetch(
          "https://restcountries.com/v3.1/all?fields=languages"
        );

        if (!countriesResponse.ok) {
          throw new Error(
            `Failed to fetch languages: ${countriesResponse.statusText}`
          );
        }

        const countriesData = await countriesResponse.json();

        // Extract unique languages from all countries
        const languageSet = new Set();
        countriesData.forEach((country) => {
          if (country.languages) {
            Object.values(country.languages).forEach((lang) =>
              languageSet.add(lang)
            );
          }
        });

        // Convert to sorted array of options
        const languageOptions = Array.from(languageSet)
          .sort()
          .map((lang) => ({
            value: lang.toLowerCase().replace(/\s+/g, "-"),
            label: lang,
          }));

        setLanguages(languageOptions);
      } catch (err) {
        console.error("Error fetching from primary API:", err);

        try {
          // Fallback 1: Try another API if the first fails
          const backupResponse = await fetch(
            "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0"
          );

          if (!backupResponse.ok) {
            throw new Error(`Backup API failed: ${backupResponse.statusText}`);
          }

          const backupData = await backupResponse.json();
          const backupOptions = Object.entries(backupData.translation)
            .map(([code, lang]) => ({
              value: code,
              label: lang.name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          setLanguages(backupOptions);
        } catch (fallbackErr) {
          console.error("Error fetching from backup API:", fallbackErr);
          setError(fallbackErr.message);

          // Final fallback: Static list of most common languages
          setLanguages([
            { value: "en", label: "English" },
            { value: "ar", label: "Arabic" },
            { value: "zh", label: "Chinese" },
            { value: "es", label: "Spanish" },
            { value: "fr", label: "French" },
            { value: "de", label: "German" },
            { value: "hi", label: "Hindi" },
            { value: "pt", label: "Portuguese" },
            { value: "ru", label: "Russian" },
            { value: "ja", label: "Japanese" },
            { value: "bn", label: "Bengali" },
            { value: "pa", label: "Punjabi" },
            { value: "ms", label: "Malay" },
            { value: "tr", label: "Turkish" },
            { value: "fa", label: "Persian (Farsi)" },
            { value: "ur", label: "Urdu" },
            { value: "so", label: "Somali" },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent rapid firing of requests during development
    const fetchTimer = setTimeout(fetchLanguages, 300);

    return () => clearTimeout(fetchTimer);
  }, []);

  return (
    <div className="language-select-container">
      <Select
        options={languages}
        value={value}
        onChange={(selectedOptions) => onChange(name, selectedOptions)}
        components={animatedComponents}
        isMulti
        placeholder={
          isLoading ? "Loading languages..." : placeholder || "Select languages"
        }
        className="react-select-container"
        classNamePrefix="react-select"
        isLoading={isLoading}
        loadingMessage={() => "Loading languages..."}
        noOptionsMessage={() =>
          error ? "Error loading languages" : "No languages found"
        }
      />

      {error && (
        <div className="text-xs text-amber-600 mt-1">
          Note: Using limited language set due to API error
        </div>
      )}
      <ErrorMessage name={name} component="div" className="error-message" />
    </div>
  );
};

export default LanguageSelect;

// shared/services/locationService.js
import debounce from "lodash.debounce";

/**
 * Creates a location search function using the LocationIQ API
 * @returns {Function} A function that loads location options for react-select
 */
export const createLocationSearchFunction = () => {
  return debounce((inputValue, callback) => {
    if (inputValue.length < 3) {
      callback([]);
      return;
    }

    fetch(
      `https://api.locationiq.com/v1/autocomplete?key=pk.288b6dab564970e7a979efef12013f91&q=${inputValue}`
    )
      .then((response) => response.json())
      .then((data) => {
        callback(
          data.map((item) => ({
            value: item.place_id,
            label: item.display_name,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching location data:", error);
        callback([]);
      });
  }, 500);
};

/**
 * Fetches countries from the LocationIQ API
 * @param {string} searchTerm - The search term to filter countries
 * @returns {Promise<Array>} - Promise resolving to an array of country objects
 */
export const fetchCountries = async (searchTerm = "") => {
  try {
    // If no search term or it's too short, we don't want to make an API call yet
    if (searchTerm.length < 2) {
      return [];
    }

    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=pk.288b6dab564970e7a979efef12013f91&q=${searchTerm}&limit=10&tag=country`
    );

    const data = await response.json();

    // Map the API response to the format expected by react-select
    return data.map((item) => ({
      value: item.place_id,
      label: item.display_name,
      // Store the raw data in case we need it later
      rawData: item,
    }));
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

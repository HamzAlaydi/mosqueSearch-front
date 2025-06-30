import { rootRoute } from "../constants/backendLink";

// Fetch all mosques from the backend
export const fetchAllMosques = async () => {
  try {
    const response = await fetch(`${rootRoute}/mosques`);
    if (!response.ok) {
      throw new Error("Failed to fetch mosques");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching mosques:", error);
    // Fallback to empty array if API fails
    return [];
  }
};

// Fetch mosques within a radius of a location
export const fetchMosquesNearby = async (lat, lng, radius = 10) => {
  try {
    const response = await fetch(
      `${rootRoute}/mosques/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch nearby mosques");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching nearby mosques:", error);
    return [];
  }
};

// Create a new mosque (for super admin)
export const createMosque = async (mosqueData, token) => {
  try {
    const response = await fetch(`${rootRoute}/mosques`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mosqueData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create mosque");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating mosque:", error);
    throw error;
  }
};

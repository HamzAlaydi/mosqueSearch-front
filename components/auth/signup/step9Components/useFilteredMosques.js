"use client";
import { useState, useEffect, useCallback } from "react";

// A custom hook to memoize mosque filtering for better performance
const useFilteredMosques = (allMosques, userLocation, distance, attachedMosqueIds) => {
  const [filteredMosques, setFilteredMosques] = useState([]);
  
  // Memoized distance calculation function
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (
      lat1 === undefined ||
      lon1 === undefined ||
      lat2 === undefined ||
      lon2 === undefined
    )
      return Infinity;

    const DEG2RAD = Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * DEG2RAD;
    const dLon = (lon2 - lon1) * DEG2RAD;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * DEG2RAD) *
        Math.cos(lat2 * DEG2RAD) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // Convert km to miles
  }, []);

  // Filter mosques efficiently in a web worker or separate effect
  useEffect(() => {
    // Skip filtering if we don't have all data
    if (!userLocation || !distance || !allMosques || allMosques.length === 0) {
      setFilteredMosques([]);
      return;
    }
    
    // Use a timeout to prevent blocking the UI thread
    const timeoutId = setTimeout(() => {
      // Process all mosques in batches for better performance
      const batchSize = 100;
      const batches = Math.ceil(allMosques.length / batchSize);
      let processed = [];
      
      // Process each batch
      for (let i = 0; i < batches; i++) {
        const startIdx = i * batchSize;
        const endIdx = Math.min((i + 1) * batchSize, allMosques.length);
        const batch = allMosques.slice(startIdx, endIdx);
        
        // Process this batch
        const batchResults = batch
          .map(mosque => {
            // Extract location data
            let lat = 0;
            let lng = 0;

            if (mosque.location) {
              if (
                typeof mosque.location.lat === "number" &&
                typeof mosque.location.lng === "number"
              ) {
                lat = mosque.location.lat;
                lng = mosque.location.lng;
              } else if (
                mosque.location.type === "Point" &&
                Array.isArray(mosque.location.coordinates) &&
                mosque.location.coordinates.length >= 2
              ) {
                lng = mosque.location.coordinates[0];
                lat = mosque.location.coordinates[1];
              }
            }

            // Skip invalid locations
            if (lat === 0 && lng === 0) return null;

            // Calculate distance only if within potential range
            // Simple bounding box check first (faster than exact calculation)
            const latDiff = Math.abs(lat - userLocation.lat);
            const lngDiff = Math.abs(lng - userLocation.lng);
            
            // Quick check: if outside rough bounding box, skip expensive calculation
            // 1 degree ~ 69 miles at equator, so this is a rough approximation
            if (latDiff > distance/60 || lngDiff > distance/60) {
              return null; // Definitely out of range
            }
            
            // Now do precise calculation for those that passed the quick check
            const dist = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lat,
              lng
            );

            if (dist > distance) return null;

            // Mosque is within range, return processed object
            return {
              ...mosque,
              id: mosque._id || mosque.id || `${lat}-${lng}-${mosque.name}`,
              location: { lat, lng },
              distance: dist,
              isAttached: attachedMosqueIds.has(mosque._id) || attachedMosqueIds.has(mosque.id),
              hasFemaleArea: mosque.facilities?.includes("Female Prayer Area") || mosque.femaleArea || false,
              description: mosque.description || "",
            };
          })
          .filter(mosque => mosque !== null);
        
        // Add batch results to processed list
        processed = [...processed, ...batchResults];
      }
      
      // Sort by distance for better UX
      processed.sort((a, b) => a.distance - b.distance);
      
      // Update state with filtered results
      setFilteredMosques(processed);
    }, 10); // Small delay to not block UI render
    
    return () => clearTimeout(timeoutId);
  }, [allMosques, userLocation, distance, attachedMosqueIds, calculateDistance]);

  return filteredMosques;
};

export default useFilteredMosques;
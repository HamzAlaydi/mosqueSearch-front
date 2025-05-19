"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import MapContainer from "./MapContainer";

const OptimizedMapContainer = ({
  userLocation,
  distance,
  attachedMosques,
  toggleMosqueAttachment,
  setError,
}) => {
  // Store actual distance value used for filtering as separate state
  const [effectiveDistance, setEffectiveDistance] = useState(distance);

  // Debounce the distance updates to avoid excessive rerendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setEffectiveDistance(distance);
    }, 300); // Update filter distance 300ms after slider stops changing

    return () => clearTimeout(timer);
  }, [distance]);

  // Pass this component and implementation to the normal MapContainer component
  // but with effectiveDistance instead of directly using distance

  return (
    <>
      <div className="text-xs text-gray-500 mb-2">
        {distance !== effectiveDistance && (
          <div className="animate-pulse text-blue-600">
            Updating map with {distance} mile radius...
          </div>
        )}
      </div>

      {/* Original MapContainer but with effectiveDistance */}
      <MapContainer
        userLocation={userLocation}
        distance={effectiveDistance} // Use debounced distance value
        attachedMosques={attachedMosques}
        toggleMosqueAttachment={toggleMosqueAttachment}
        setError={setError}
      />
    </>
  );
};

export default OptimizedMapContainer;

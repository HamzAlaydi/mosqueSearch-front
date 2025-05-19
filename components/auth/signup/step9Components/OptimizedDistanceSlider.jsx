"use client";
import { useState, useEffect, useCallback } from "react";

const OptimizedDistanceSlider = ({
  values,
  errors,
  touched,
  setFieldValue,
}) => {
  // Use a local state to track the slider position while dragging
  const [localDistance, setLocalDistance] = useState(values.distance);
  // Track if the user is actively dragging
  const [isDragging, setIsDragging] = useState(false);

  // Update local state when prop values change (e.g., form reset)
  useEffect(() => {
    if (!isDragging) {
      setLocalDistance(values.distance);
    }
  }, [values.distance, isDragging]);

  // Debounce the actual form value update
  useEffect(() => {
    // Only update the form value if the user is not currently dragging
    // or we have a timer to debounce the change
    if (!isDragging && localDistance !== values.distance) {
      const timer = setTimeout(() => {
        setFieldValue("distance", localDistance);
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    }
  }, [localDistance, setFieldValue, values.distance, isDragging]);

  // Handle slider interaction
  const handleSliderChange = useCallback((e) => {
    const newValue = parseInt(e.target.value);
    setLocalDistance(newValue);
  }, []);

  // Handle drag start and end
  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Update the form value immediately when the user stops dragging
    setFieldValue("distance", localDistance);
  }, [localDistance, setFieldValue]);

  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600 mb-1 block">
        Search Distance: {localDistance} miles
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={localDistance}
        onChange={handleSliderChange}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1 mi</span>
        <span>25 mi</span>
        <span>50 mi</span>
        <span>75 mi</span>
        <span>100 mi</span>
      </div>
      {localDistance * 1609.34 > 50000 && (
        <div className="text-yellow-600 text-xs mt-1">
          Note: Maximum search radius is limited to ~31 miles by Google Maps
        </div>
      )}
      {errors.distance && touched.distance && (
        <div className="text-red-500 text-xs mt-1">{errors.distance}</div>
      )}
    </div>
  );
};

export default OptimizedDistanceSlider;

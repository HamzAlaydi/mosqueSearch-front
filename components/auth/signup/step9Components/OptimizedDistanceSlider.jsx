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
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Search Distance
        </label>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
          {localDistance} miles
        </span>
      </div>
      
      <div className="relative">
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
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(localDistance - 1) / 99 * 100}%, #e5e7eb ${(localDistance - 1) / 99 * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Custom slider thumb for better mobile experience */}
        <style jsx>{`
          .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            border: 3px solid white;
            transition: all 0.2s ease;
          }
          
          .slider-thumb::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
          
          .slider-thumb::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }
        `}</style>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span className="font-medium">1 mi</span>
        <span>25 mi</span>
        <span>50 mi</span>
        <span>75 mi</span>
        <span className="font-medium">100 mi</span>
      </div>
      
      {localDistance * 1609.34 > 50000 && (
        <div className="text-yellow-600 text-xs mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
          ⚠️ Note: Maximum search radius is limited to ~31 miles by Google Maps
        </div>
      )}
      
      {errors.distance && touched.distance && (
        <div className="text-red-500 text-xs mt-2 p-2 bg-red-50 rounded-md border border-red-200">
          {errors.distance}
        </div>
      )}
    </div>
  );
};

export default OptimizedDistanceSlider;

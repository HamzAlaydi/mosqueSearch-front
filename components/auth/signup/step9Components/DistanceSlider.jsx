const DistanceSlider = ({ values, errors, touched, setFieldValue }) => {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600 mb-1 block">
        Search Distance: {values.distance} miles
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={values.distance}
        onChange={(e) => {
          const newValue = parseInt(e.target.value);
          setFieldValue("distance", newValue);
        }}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1 mi</span>
        <span>25 mi</span>
        <span>50 mi</span>
        <span>75 mi</span>
        <span>100 mi</span>
      </div>
      {values.distance * 1609.34 > 50000 && (
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

export default DistanceSlider;

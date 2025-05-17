// 1. FullScreenHeader
const FullScreenHeader = React.memo(
  ({
    isFullScreen,
    toggleFullScreen,
    mosquesCount,
    distance,
    searchingMosques,
    FULLSCREEN_HEADER_HEIGHT_PX,
  }) => {
    if (!isFullScreen) return null;

    return (
      <div
        className="p-3 border-b flex justify-between items-center bg-white shadow-sm"
        style={{
          height: `${FULLSCREEN_HEADER_HEIGHT_PX}px`,
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={toggleFullScreen}
          className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Form</span>
        </button>
        <div className="text-center flex-grow">
          <h2 className="font-semibold text-lg text-gray-800">Map View</h2>
          {!searchingMosques && (
            <p className="text-sm text-gray-600">
              {mosquesCount} mosques found within {distance} miles
            </p>
          )}
        </div>
        <div className="w-28"></div> {/* Spacer */}
      </div>
    );
  }
);

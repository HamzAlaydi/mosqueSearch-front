const SelectedMosquesList = ({ attachedMosques, toggleMosqueAttachment }) => {
    return (
      <div className="mb-4">
        <h3 className="font-medium mb-3 text-gray-800 text-sm">
          Selected Mosques ({attachedMosques.length})
        </h3>
        <div className="bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
          {attachedMosques.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">
                No mosques selected yet. Click on mosque markers to connect.
              </p>
            </div>
          ) : (
            attachedMosques.map((mosque) => (
              <div
                key={mosque.id}
                className="flex justify-between items-start py-2 px-2 border-b border-gray-200 last:border-0 bg-white rounded-lg mb-1 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-xs mb-1 truncate">
                    {mosque.name}
                  </p>
                  <p className="text-xs text-gray-600 mb-1 truncate">
                    {mosque.address}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {mosque.distance.toFixed(1)} miles away
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMosqueAttachment(mosque)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors duration-150 ml-2 flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  export default SelectedMosquesList;
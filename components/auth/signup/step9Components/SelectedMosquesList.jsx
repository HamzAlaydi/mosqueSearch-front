const SelectedMosquesList = ({ attachedMosques, toggleMosqueAttachment }) => {
    return (
      <div className="mb-4">
        <h3 className="font-medium mb-2">
          Selected Mosques ({attachedMosques.length})
        </h3>
        <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
          {attachedMosques.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No mosques selected yet. Click on mosque markers to connect.
            </p>
          ) : (
            attachedMosques.map((mosque) => (
              <div
                key={mosque.id}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="font-medium">{mosque.name}</p>
                  <p className="text-sm text-gray-600">{mosque.address}</p>
                  <p className="text-xs text-gray-500">
                    {mosque.distance.toFixed(1)} miles away
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMosqueAttachment(mosque)}
                  className="text-red-500 text-sm hover:text-red-700"
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
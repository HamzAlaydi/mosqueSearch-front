import { useState, useEffect } from "react";
import { X, Check, Clock, User, MapPin, Edit, AlertCircle } from "lucide-react";

const EditRequestModal = ({
  isOpen,
  onClose,
  request,
  onSave,
  loading = false,
}) => {
  const [status, setStatus] = useState("pending");
  const [response, setResponse] = useState("");
  const [denialReason, setDenialReason] = useState("");

  useEffect(() => {
    if (request) {
      setStatus(request.status || "pending");
      setResponse(request.imamResponse || "");
      setDenialReason(request.denialReason || "");
    }
  }, [request]);

  const handleSave = async () => {
    console.log("EditRequestModal handleSave called");
    console.log("Status:", status);
    console.log("Response:", response);
    console.log("DenialReason:", denialReason);

    if (status === "denied" && !denialReason.trim()) {
      console.log("Denied status but no denial reason provided");
      return; // Don't save if denied but no reason provided
    }

    console.log("Calling onSave with:", {
      status,
      response: response,
      denialReason,
    });
    await onSave({ status, response: response, denialReason });
    onClose();
  };

  const handleClose = () => {
    setStatus(request?.status || "pending");
    setResponse(request?.imamResponse || "");
    setDenialReason(request?.denialReason || "");
    onClose();
  };

  if (!isOpen || !request) return null;

  const isApproved = status === "approved";
  const isDenied = status === "denied";
  const isPending = status === "pending";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-[1.5px]"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-white mr-2" />
                <h3 className="text-lg leading-6 font-medium text-white">
                  Edit Request Status & Response
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {/* Request Details */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Request Details
              </h4>

              {/* User Info */}
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {request.user.name}
                  </p>
                  <p className="text-xs text-gray-500">{request.user.email}</p>
                </div>
              </div>

              {/* Mosque Info */}
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {request.mosque.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.mosque.address}
                  </p>
                </div>
              </div>

              {/* Current Status */}
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Clock className="h-3 w-3 mr-1" />
                Current Status:{" "}
                {request.status.charAt(0).toUpperCase() +
                  request.status.slice(1)}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              {/* Status Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Approval Response */}
              {isApproved && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Response
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your approval response..."
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              {/* Denial Reason */}
              {isDenied && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denial Reason
                  </label>
                  <textarea
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    placeholder="Enter reason for denial..."
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              )}

              {/* Info Alert */}
              <div className="rounded-md bg-blue-50 p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {isApproved
                        ? "This response will be visible to the user and can be updated at any time."
                        : isDenied
                        ? "This reason will be visible to the user and can be updated at any time."
                        : "The request will be set back to pending status."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSave}
              disabled={loading || (isDenied && !denialReason.trim())}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRequestModal;

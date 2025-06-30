import { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const EditMosqueRequestModal = ({ open, onClose, request, onSave }) => {
  const [status, setStatus] = useState(request?.status || "pending");
  const [superadminResponse, setSuperadminResponse] = useState(
    request?.superadminResponse || ""
  );
  const [denialReason, setDenialReason] = useState(request?.denialReason || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request) {
      setStatus(request.status || "pending");
      setSuperadminResponse(request.superadminResponse || "");
      setDenialReason(request.denialReason || "");
    }
  }, [request]);

  const handleSave = async () => {
    if (status === "denied" && !denialReason.trim()) {
      return; // Don't save if denied but no reason provided
    }

    setLoading(true);
    try {
      await onSave({ status, superadminResponse, denialReason });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(request?.status || "pending");
    setSuperadminResponse(request?.superadminResponse || "");
    setDenialReason(request?.denialReason || "");
    onClose();
  };

  if (!open || !request) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "denied":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "denied":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

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
                <MapPin className="h-5 w-5 text-white mr-2" />
                <h3 className="text-lg leading-6 font-medium text-white">
                  Edit Mosque Request Status
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

              {/* Imam Info */}
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {request.imamId?.name || "Unknown Imam"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.imamId?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Mosque Info */}
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {request.mosqueId?.name || "Unknown Mosque"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.mosqueId?.address || "Address not available"}
                  </p>
                </div>
              </div>

              {/* Current Status */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusIcon(request.status)}
                <span className="ml-2">
                  Current Status:{" "}
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </span>
              </div>
            </div>

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
            {status === "approved" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Response
                </label>
                <textarea
                  value={superadminResponse}
                  onChange={(e) => setSuperadminResponse(e.target.value)}
                  placeholder="Enter your approval response..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

            {/* Denial Reason */}
            {status === "denied" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denial Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="Please provide a reason for denial..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {/* Request Message */}
            {request.message && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Message
                </label>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-900">{request.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Info */}
            {status === "approved" && (
              <div className="mb-4 rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Imam will be automatically assigned to this mosque when
                      approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSave}
              disabled={
                loading || (status === "denied" && !denialReason.trim())
              }
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMosqueRequestModal;

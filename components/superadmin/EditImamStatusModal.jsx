import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const EditImamStatusModal = ({ open, onClose, imam, onSave }) => {
  const [status, setStatus] = useState(imam?.status || "pending");
  const [deniedReason, setDeniedReason] = useState(imam?.deniedReason || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (imam) {
      setStatus(imam.status || "pending");
      setDeniedReason(imam.deniedReason || "");
    }
  }, [imam]);

  const handleSave = async () => {
    if (status === "denied" && !deniedReason.trim()) {
      return; // Don't save if denied but no reason provided
    }

    setLoading(true);
    try {
      await onSave({ status, deniedReason });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(imam?.status || "pending");
    setDeniedReason(imam?.deniedReason || "");
    onClose();
  };

  if (!open || !imam) return null;

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
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-white mr-2" />
                <h3 className="text-lg leading-6 font-medium text-white">
                  Edit Imam Status
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
            {/* Imam Details */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Imam Details
              </h4>

              {/* Imam Info */}
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-blue-600">
                    {imam.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {imam.name}
                  </p>
                  <p className="text-xs text-gray-500">{imam.email}</p>
                </div>
              </div>

              {/* Current Status */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  imam.status
                )}`}
              >
                {getStatusIcon(imam.status)}
                <span className="ml-2">
                  Current Status:{" "}
                  {imam.status.charAt(0).toUpperCase() + imam.status.slice(1)}
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

            {/* Denial Reason */}
            {status === "denied" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denial Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deniedReason}
                  onChange={(e) => setDeniedReason(e.target.value)}
                  placeholder="Please provide a reason for denial..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {/* Approval Info */}
            {status === "approved" && (
              <div className="mb-4 rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Imam will be automatically assigned to their selected
                      mosques when approved.
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
                loading || (status === "denied" && !deniedReason.trim())
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

export default EditImamStatusModal;

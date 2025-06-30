import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const DenialModal = ({ open, onClose, onConfirm, request }) => {
  const [denialReason, setDenialReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!denialReason.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(denialReason.trim());
      setDenialReason("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDenialReason("");
    onClose();
  };

  if (!open || !request) return null;

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
          <div className="bg-red-600 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-white mr-2" />
                <h3 className="text-lg leading-6 font-medium text-white">
                  Deny Request
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
            <div className="mb-4">
              <p className="text-sm text-gray-900 mb-2">
                <strong>Imam:</strong> {request.imamId?.name}
              </p>
              <p className="text-sm text-gray-900 mb-4">
                <strong>Mosque:</strong> {request.mosqueId?.name}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denial Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Please provide a reason for denial..."
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleConfirm}
              disabled={loading || !denialReason.trim()}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Denying..." : "Deny Request"}
            </button>
            <button
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenialModal;

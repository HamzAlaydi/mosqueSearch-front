import { AlertTriangle, Check, X, User, MapPin } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  action,
  request,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !request) return null;

  const isApprove = action === "approve";
  const isDeny = action === "deny";

  const getActionConfig = () => {
    if (isApprove) {
      return {
        title: "Approve Verification Request",
        message: "Are you sure you want to approve this verification request?",
        icon: Check,
        iconColor: "text-green-600",
        bgColor: "bg-green-600",
        hoverColor: "hover:bg-green-700",
        buttonText: "Approve Request",
      };
    } else if (isDeny) {
      return {
        title: "Deny Verification Request",
        message: "Are you sure you want to deny this verification request?",
        icon: X,
        iconColor: "text-red-600",
        bgColor: "bg-red-600",
        hoverColor: "hover:bg-red-700",
        buttonText: "Deny Request",
      };
    }
    return null;
  };

  const config = getActionConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur */}
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-[1.5px]"
          onClick={onClose}
        />

        {/* Modal panel with glass effect */}
        <div className="inline-block align-bottom bg-white/95 backdrop-blur-md rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20">
          {/* Header */}
          <div className={`${config.bgColor} px-4 py-3 sm:px-6`}>
            <div className="flex items-center">
              <Icon className={`h-5 w-5 ${config.iconColor} mr-2`} />
              <h3 className="text-lg leading-6 font-medium text-white">
                {config.title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {/* Alert */}
            <div className="rounded-md bg-yellow-50 p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{config.message}</p>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
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

              {/* Message */}
              {request.message && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">User's Message:</p>
                  <p className="text-sm text-gray-900 bg-white/80 backdrop-blur-sm p-2 rounded border border-gray-200/50">
                    {request.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200/50">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${config.bgColor} text-base font-medium text-white ${config.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                config.buttonText
              )}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white/90 backdrop-blur-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

import {
  Check,
  X,
  Edit,
  User,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const RequestTable = ({
  requests,
  onAccept,
  onDeny,
  onEdit,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <User className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No requests found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by reviewing verification requests from community members.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      approved: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800",
        label: "Approved",
      },
      denied: {
        icon: XCircle,
        className: "bg-red-100 text-red-800",
        label: "Denied",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mosque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Response
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                {/* User Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {request.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.user.phone || "Not provided"}
                </td>

                {/* Mosque Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.mosque.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.mosque.address}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Message Column */}
                <td className="px-6 py-4">
                  <div
                    className="text-sm text-gray-900 max-w-xs truncate"
                    title={request.message}
                  >
                    {request.message}
                  </div>
                </td>

                {/* Response Column */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {request.status === "approved" && request.imamResponse ? (
                      <span
                        className="text-green-600"
                        title={request.imamResponse}
                      >
                        {request.imamResponse}
                      </span>
                    ) : request.status === "denied" && request.denialReason ? (
                      <span
                        className="text-red-600"
                        title={request.denialReason}
                      >
                        {request.denialReason}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {request.status === "pending" ? (
                      <>
                        <button
                          onClick={() => onAccept(request.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          title="Approve verification"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeny(request.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Deny verification"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onEdit(request.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Edit response"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;

import { useState } from "react";
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
  Eye,
  Calendar,
  Building,
} from "lucide-react";
import DataTable from "@/components/common/DataTable";

const ImamMosqueRequestsTable = ({
  requests = [],
  onApprove,
  onDeny,
  onEdit,
  loading = false,
}) => {
  const [expandedMessage, setExpandedMessage] = useState(null);

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
          <MapPin className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No imam mosque requests found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          All requests have been processed or no new requests are pending.
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

  const columns = [
    {
      id: "imamName",
      label: "Imam",
      width: "180px",
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {row.imamId?.name?.charAt(0).toUpperCase() || "I"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.imamId?.name || "Unknown Imam"}
            </div>
            <div className="text-sm text-gray-500">
              {row.imamId?.email || "No email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "mosqueName",
      label: "Mosque",
      width: "200px",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.mosqueId?.name || "Unknown Mosque"}
            </div>
            <div
              className="text-sm text-gray-500 truncate max-w-40"
              title={row.mosqueId?.address}
            >
              {row.mosqueId?.address || "Address not available"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "message",
      label: "Request Message",
      width: "200px",
      render: (row) => (
        <div className="relative">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <div
              className="text-sm text-gray-900 max-w-32 truncate"
              title={row.message}
            >
              {row.message}
            </div>
            <button
              onClick={() =>
                setExpandedMessage(expandedMessage === row._id ? null : row._id)
              }
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {expandedMessage === row._id && (
            <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs">
              <div className="text-sm text-gray-900">{row.message}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: "100px",
      render: (row) => getStatusBadge(row.status),
    },
    {
      id: "createdAt",
      label: "Requested",
      width: "120px",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-900">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      width: "120px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end space-x-2">
          {row.status === "pending" ? (
            <>
              <button
                onClick={() => onApprove(row._id)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                title="Approve request"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDeny(row._id)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                title="Deny request"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onEdit(row._id)}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              title="Edit status"
            >
              <Edit className="h-3 w-3" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <DataTable
        columns={columns}
        data={requests}
        searchFields={["imamId.name", "imamId.email", "mosqueId.name"]}
        searchPlaceholder="Search by imam name, email, mosque..."
        initialRowsPerPage={10}
        noDataMessage="No imam mosque requests found"
      />
    </div>
  );
};

export default ImamMosqueRequestsTable;
